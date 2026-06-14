using Microsoft.AspNetCore.Mvc;
using CombatCatalyst.Server.Services;
using CombatCatalyst.Server.Models;
using CombatCatalyst.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CombatCatalyst.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonsterController : ControllerBase
    {
        private readonly IOpen5eService _open5eService;
        private readonly AppDbContext _context;
        private readonly ILogger<MonsterController> _logger;

        public MonsterController(IOpen5eService open5eService, AppDbContext context, ILogger<MonsterController> logger)
        {
            _open5eService = open5eService;
            _context = context;
            _logger = logger;
        }

        [HttpGet("{name}")]
        public async Task<ActionResult<Monster>> Get(string name)
        {
            /**
             * Cache-Aside Pattern Implementation
             * Queries the local SQLite data tier first, eager-loading child collections
             * to fulfill the entity structure completely. If a cache miss occurs, the 
             * request delegates data ingestion to the Open5eService.
             */
            var localMonster = await _context.Monsters
                .Include(m => m.Actions)
                .Include(m => m.SpecialAbilities)
                .Include(m => m.LegendaryActions)
                .Include(m => m.Reactions)
                .FirstOrDefaultAsync(m => m.Name.ToLower() == name.ToLower() || m.Slug.ToLower() == name.ToLower());

            if (localMonster != null)
            {
                _logger.LogInformation("Found {Name} in LOCAL database. Skipping API call.", name);
                return Ok(localMonster);
            }

            _logger.LogInformation("{Name} not found locally. Fetching from Open5e...", name);
            var apiMonster = await _open5eService.GetMonsterAsync(name);

            if (apiMonster == null)
            {
                return NotFound("Monster not found in local DB or external API.");
            }

            try
            {
                _context.Monsters.Add(apiMonster);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully saved {Name} to the local database.", apiMonster.Name);
            }
            catch (Exception ex)
            {
                /**
                 * Fail-Safe Fault Tolerance:
                 * Logs any internal persistence database exceptions, but returns the 
                 * runtime entity back to the UI to ensure DM gameplay isn't blocked.
                 */
                _logger.LogError("Could not save monster to DB: {Message}", ex.Message);
            }

            return Ok(apiMonster);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Monster>>> GetAll()
        {
            _logger.LogInformation("Fetching all saved monsters for the Bestiary.");
            var monsters = await _context.Monsters
                .Include(m => m.Actions)
                .Include(m => m.SpecialAbilities)
                .Include(m => m.LegendaryActions)
                .Include(m => m.Reactions)
                .OrderBy(m => m.Name)
                .ToListAsync();

            return Ok(monsters);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var monster = await _context.Monsters.FindAsync(id);
            if (monster == null)
            {
                return NotFound();
            }

            _context.Monsters.Remove(monster);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted monster ID {Id} from local database.", id);
            return NoContent();
        }
    }
}