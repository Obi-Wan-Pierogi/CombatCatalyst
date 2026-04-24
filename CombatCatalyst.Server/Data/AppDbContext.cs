using CombatCatalyst.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace CombatCatalyst.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // These DbSets represent your actual SQL Tables
        public DbSet<Monster> Monsters { get; set; }
        public DbSet<SpecialAbility> SpecialAbilities { get; set; }
        public DbSet<MonsterAction> MonsterActions { get; set; }
        public DbSet<LegendaryAction> LegendaryActions { get; set; }
        public DbSet<Reaction> Reactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // This ensures that the Slug (e.g., "srd_goblin") must be unique in the database
            modelBuilder.Entity<Monster>()
                .HasIndex(m => m.Slug)
                .IsUnique();
        }
    }
}