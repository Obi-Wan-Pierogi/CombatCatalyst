using System.Threading.Tasks;
using CombatCatalyst.Server.Models;

namespace CombatCatalyst.Server.Services
{
    public interface IOpen5eService
    {
        // The contract: any class using this interface MUST have a method 
        // that takes a string and returns a Task containing a Monster (or null)
        Task<Monster?> GetMonsterAsync(string monsterSlug);
    }
}