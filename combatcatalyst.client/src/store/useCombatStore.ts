import { create } from 'zustand';
// FIX: Added 'type' keyword for verbatimModuleSyntax compliance
import type { CombatState, CombatAction, ActiveCombatant } from '../types/combat';

interface CombatStore extends CombatState {
    dispatch: (action: CombatAction) => void;
}

/**
 * The Combat Engine Store
 * Strictly handles state transitions based on dispatched actions.
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
                const updatedList = [...state.combatants, action.payload];
                // Sort descending: highest initiative roll at the top (index 0)
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
                const nextIndex = (state.activeCombatantIndex + 1) % state.combatants.length;
                const nextRound = nextIndex === 0 ? state.currentRound + 1 : state.currentRound;

                // Refresh resources for the combatant whose turn is starting
                const refreshedCombatants = state.combatants.map((c, index) => {
                    if (index === nextIndex) {
                        return {
                            ...c,
                            hasReactionAvailable: true,
                            legendaryActionsRemaining: 3, // Reset to standard legendary cap
                            actionUsed: false,
                            bonusActionUsed: false,
                            movementRemaining: c.speedInFeet || 30, // Reset movement allowance
                            isSurprised: false // Surprise condition naturally ends after their first turn
                        };
                    }
                    return c;
                });

                return {
                    activeCombatantIndex: nextIndex,
                    currentRound: nextRound,
                    combatants: refreshedCombatants,
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