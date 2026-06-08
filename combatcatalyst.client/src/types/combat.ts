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
    // ... any additional static properties from the Open5e API
}

export interface MonsterTrait {
    name: string;
    desc: string;
}

/**
 * PHASE 1 UPDATED: ActiveCombatant
 * Extends Monster to include dynamic state for the combat engine.
 */
export interface ActiveCombatant extends Monster {
    // Unique Identifiers
    instanceId: string;           // Allows multiple "Goblin" instances
    isPlayer: boolean;            // Differentiates PCs from NPCs

    // Vitality & Resources
    currentHp: number;
    maxHp: number;
    tempHp: number;
    initiativeRoll: number;

    // Stats
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;

    // SRS MVP Requirements
    deathSaveSuccesses: number;   // Range: 0-3
    deathSaveFailures: number;    // Range: 0-3
    legendaryActionsRemaining: number;
    hasReactionAvailable: boolean;

    // Status Management
    conditions: string[];         // e.g., ['Prone', 'Grappled']

    // Actions and Abilities
    special_abilities?: MonsterTrait[];
    actions?: MonsterTrait[];

    // Action Economy & Advanced Rules
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
 * PHASE 1 UPDATED: CombatAction
 * Exhaustive list of intents for the Dispatcher.
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