/**
 * Represents the base metadata for a creature. 
 * Inherited from the core Monster model.
 */
export interface Monster {
    name: string;
    size: string;
    type: string;
    armorClass: number;
    hitPoints: number;
    speed: string;
}

export interface MonsterTrait {
    name: string;
    desc: string;
}

/**
 * Extends the base Monster model to include dynamic state for the combat engine.
 * Represents a unique, active entity currently on the battlefield.
 */
export interface ActiveCombatant extends Monster {
    // Unique Identifiers
    instanceId: string;           // Differentiates multiple instances of the same monster type (e.g., Goblin 1 vs Goblin 2)
    isPlayer: boolean;            // Bypasses automated stat blocks and enables player-specific UI (e.g., Death Saves)

    // Vitality & Resources
    currentHp: number;
    maxHp: number;
    tempHp: number;
    initiativeRoll: number;

    // Core Stats
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;

    // State Tracking
    deathSaveSuccesses: number;
    deathSaveFailures: number;
    legendaryActionsRemaining: number;
    hasReactionAvailable: boolean;
    conditions: string[];

    // Actions and Abilities
    special_abilities?: MonsterTrait[];
    actions?: MonsterTrait[];

    // Action Economy Tracking
    actionUsed: boolean;
    bonusActionUsed: boolean;
    movementRemaining: number;
    speedInFeet: number;
    isSurprised: boolean;
    isConcentrating: boolean;
}

/**
 * Structure for historical tracking in the UI.
 */
export interface CombatLogEntry {
    id: string;
    timestamp: Date;
    message: string;
    type: 'damage' | 'healing' | 'status' | 'system';
}

/**
 * Global Combat State Shape
 */
export interface CombatState {
    combatants: ActiveCombatant[];
    currentRound: number;
    activeCombatantIndex: number;
    combatLog: CombatLogEntry[];
    isCombatStarted: boolean;
}

/**
 * Exhaustive list of state mutation intents for the Zustand Dispatcher.
 */
export type CombatAction =
    | { type: 'ADD_COMBATANT'; payload: ActiveCombatant }
    | { type: 'REMOVE_COMBATANT'; payload: string }
    | { type: 'UPDATE_HP'; payload: { instanceId: string; amount: number } }
    | { type: 'TOGGLE_CONDITION'; payload: { instanceId: string; condition: string } }
    | { type: 'TOGGLE_CONCENTRATION'; payload: string }
    | { type: 'UPDATE_DEATH_SAVES'; payload: { instanceId: string; successes: number; failures: number } }
    | { type: 'NEXT_TURN' }
    | { type: 'RESET_COMBAT' }
    | { type: 'LOG_EVENT'; payload: string };