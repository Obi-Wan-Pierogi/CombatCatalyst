import { create } from 'zustand';
import type { CombatState, CombatAction } from '../types/combat';

interface CombatStore extends CombatState {
    dispatch: (action: CombatAction) => void;
}

/**
 * Central state management engine.
 * Utilizes the Zustand Facade pattern to expose a single dispatch method,
 * shielding React components from direct state mutation logic and reducing re-renders.
 */
export const useCombatStore = create<CombatStore>()((set) => ({
    combatants: [],
    currentRound: 1,
    activeCombatantIndex: 0,
    combatLog: [],
    isCombatStarted: false,

    dispatch: (action) => set((state) => {
        switch (action.type) {
            case 'ADD_COMBATANT': {
                const newCombatant = { ...action.payload };
                const baseName = newCombatant.name;

                const matches = state.combatants.filter(
                    c => c.name === baseName || c.name.startsWith(`${baseName} `)
                );

                if (matches.length > 0) {
                    newCombatant.name = `${baseName} ${matches.length + 1}`;
                }

                const updatedList = [...state.combatants, newCombatant];
                updatedList.sort((a, b) => b.initiativeRoll - a.initiativeRoll);

                return { combatants: updatedList };
            }

            case 'REMOVE_COMBATANT':
                return {
                    combatants: state.combatants.filter(c => c.instanceId !== action.payload)
                };

            case 'UPDATE_HP':
                return {
                    combatants: state.combatants.map(c =>
                        c.instanceId === action.payload.instanceId
                            ? { ...c, currentHp: Math.min(Math.max(c.currentHp + action.payload.amount, 0), c.maxHp) }
                            : c
                    )
                };

            case 'TOGGLE_CONDITION':
                return {
                    combatants: state.combatants.map(c =>
                        c.instanceId === action.payload.instanceId
                            ? {
                                ...c,
                                conditions: c.conditions.includes(action.payload.condition)
                                    ? c.conditions.filter(cond => cond !== action.payload.condition)
                                    : [...c.conditions, action.payload.condition]
                            }
                            : c
                    )
                };

            case 'TOGGLE_CONCENTRATION':
                return {
                    combatants: state.combatants.map(c =>
                        c.instanceId === action.payload
                            ? { ...c, isConcentrating: !c.isConcentrating }
                            : c
                    )
                };

            case 'UPDATE_DEATH_SAVES':
                return {
                    combatants: state.combatants.map(c =>
                        c.instanceId === action.payload.instanceId
                            ? { ...c, deathSaveSuccesses: action.payload.successes, deathSaveFailures: action.payload.failures }
                            : c
                    )
                };

            case 'NEXT_TURN': {
                if (state.combatants.length === 0) return state;

                /**
                 * Carousel Initiative Rotation
                 * Shifts the active combatant to the end of the queue.
                 * This guarantees the currently acting entity is always locked to index 0,
                 * simplifying downstream UI rendering logic.
                 */
                const updatedCombatants = [...state.combatants];
                const finishedCombatant = updatedCombatants.shift();

                if (finishedCombatant) {
                    updatedCombatants.push(finishedCombatant);
                }

                // Reset 5e action economy resources for the incoming active combatant
                if (updatedCombatants.length > 0) {
                    updatedCombatants[0] = {
                        ...updatedCombatants[0],
                        hasReactionAvailable: true,
                        legendaryActionsRemaining: 3,
                        actionUsed: false,
                        bonusActionUsed: false,
                        movementRemaining: updatedCombatants[0].speedInFeet || 30,
                        isSurprised: false
                    };
                }

                /**
                 * Round Calculation
                 * Tracks the highest original initiative roll on the board.
                 * When that specific combatant rotates back to index 0, a full round has elapsed.
                 */
                let nextRound = state.currentRound;
                if (updatedCombatants.length > 1) {
                    const highestInit = Math.max(...updatedCombatants.map(c => c.initiativeRoll));
                    if (updatedCombatants[0].initiativeRoll === highestInit) {
                        nextRound += 1;
                    }
                }

                return {
                    combatants: updatedCombatants,
                    activeCombatantIndex: 0,
                    currentRound: nextRound,
                    isCombatStarted: true
                };
            }

            case 'LOG_EVENT':
                return {
                    combatLog: [
                        {
                            id: crypto.randomUUID(),
                            timestamp: new Date(),
                            message: action.payload,
                            type: 'system' as const
                        },
                        ...state.combatLog
                    ].slice(0, 50)
                };

            case 'RESET_COMBAT':
                return {
                    combatants: [],
                    currentRound: 1,
                    activeCombatantIndex: 0,
                    combatLog: [],
                    isCombatStarted: false
                };

            default:
                return state;
        }
    }),
}));