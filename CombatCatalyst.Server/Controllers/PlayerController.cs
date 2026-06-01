using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CombatCatalyst.Server.Data;
using CombatCatalyst.Server.Models;

namespace CombatCatalyst.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlayerController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Player
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlayerCharacter>>> GetAll()
        {
            return await _context.PlayerCharacters.ToListAsync();
        }

        // POST: api/Player
        [HttpPost]
        public async Task<ActionResult<PlayerCharacter>> Create(PlayerCharacter pc)
        {
            _context.PlayerCharacters.Add(pc);
            await _context.SaveChangesAsync();
            return Ok(pc);
        }

        // DELETE: api/Player/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pc = await _context.PlayerCharacters.FindAsync(id);
            if (pc == null) return NotFound();

            _context.PlayerCharacters.Remove(pc);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}