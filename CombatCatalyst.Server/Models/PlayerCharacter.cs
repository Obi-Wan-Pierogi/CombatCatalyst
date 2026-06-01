namespace CombatCatalyst.Server.Models
{
    public class PlayerCharacter
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ArmorClass { get; set; }
        public int MaxHp { get; set; }
        public int InitiativeBonus { get; set; }
    }
}