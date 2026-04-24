using Microsoft.AspNetCore.Mvc;
using CombatCatalyst.Server.Services;
using CombatCatalyst.Server.Models;
using CombatCatalyst.Server.Data; // Add this
using Microsoft.EntityFrameworkCore; // Add this

namespace CombatCatalyst.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonsterController : ControllerBase
    {
        private readonly IOpen5eService _open5eService;
        private readonly AppDbContext _context; // Our new database bridge
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
            // 1. Check the local SQL Database first
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

            // 2. If not found locally, fetch from the API
            _logger.LogInformation("{Name} not found locally. Fetching from Open5e...", name);
            var apiMonster = await _open5eService.GetMonsterAsync(name);

            if (apiMonster == null)
            {
                return NotFound("Monster not found in local DB or external API.");
            }

            // 3. Save the new monster to our local database for next time
            try
            {
                _context.Monsters.Add(apiMonster);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully saved {Name} to the local database.", apiMonster.Name);
            }
            catch (Exception ex)
            {
                // We log the error but still return the monster so the user isn't interrupted
                _logger.LogError("Could not save monster to DB: {Message}", ex.Message);
            }

            return Ok(apiMonster);
        }
    }
}