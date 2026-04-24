using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace CombatCatalyst.Server.Models // Updated namespace to match VS template
{
    public class Monster
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonPropertyName("slug")]
        public string Slug { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("size")]
        public string Size { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("alignment")]
        public string Alignment { get; set; }

        [JsonPropertyName("armor_class")]
        public int ArmorClass { get; set; }

        [JsonPropertyName("hit_points")]
        public int HitPoints { get; set; }

        [JsonPropertyName("hit_dice")]
        public string HitDice { get; set; }

        [JsonPropertyName("strength")]
        public int Strength { get; set; }

        [JsonPropertyName("dexterity")]
        public int Dexterity { get; set; }

        [JsonPropertyName("constitution")]
        public int Constitution { get; set; }

        [JsonPropertyName("intelligence")]
        public int Intelligence { get; set; }

        [JsonPropertyName("wisdom")]
        public int Wisdom { get; set; }

        [JsonPropertyName("charisma")]
        public int Charisma { get; set; }

        [JsonPropertyName("challenge_rating")]
        public string ChallengeRating { get; set; }

        [JsonPropertyName("special_abilities")]
        public List<SpecialAbility> SpecialAbilities { get; set; } = new();

        [JsonPropertyName("actions")]
        public List<MonsterAction> Actions { get; set; } = new();

        [JsonPropertyName("legendary_actions")]
        public List<LegendaryAction> LegendaryActions { get; set; } = new();

        [JsonPropertyName("reactions")]
        public List<Reaction> Reactions { get; set; } = new();
    }

    public class SpecialAbility
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("desc")]
        public string Description { get; set; }

        [JsonIgnore]
        public int MonsterId { get; set; }
        [JsonIgnore]
        public Monster Monster { get; set; }
    }

    public class MonsterAction
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("desc")]
        public string Description { get; set; }

        [JsonIgnore]
        public int MonsterId { get; set; }
        [JsonIgnore]
        public Monster Monster { get; set; }
    }

    public class LegendaryAction
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("desc")]
        public string Description { get; set; }

        [JsonIgnore]
        public int MonsterId { get; set; }
        [JsonIgnore]
        public Monster Monster { get; set; }
    }

    public class Reaction
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("desc")]
        public string Description { get; set; }

        [JsonIgnore]
        public int MonsterId { get; set; }
        [JsonIgnore]
        public Monster Monster { get; set; }
    }
}