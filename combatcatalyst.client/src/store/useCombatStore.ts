import { create } from 'zustand';
import type { CombatState, CombatAction, ActiveCombatant } from '../types/combat';

interface CombatStore extends CombatState {
    dispatch: (action: CombatAction) => void;
}

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

                // Note: If you add someone MID-COMBAT in a carousel, 
                // you may want to rethink this sort in the future so it doesn't 
                // instantly jump them to the top of the line. For now, it remains as requested.
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

                // 1. Copy the array and apply the carousel shift
                const updatedCombatants = [...state.combatants];
                const finishedCombatant = updatedCombatants.shift();

                if (finishedCombatant) {
                    updatedCombatants.push(finishedCombatant);
                }

                // 2. Refresh resources for the NEW top combatant (index 0)
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

                // 3. Check if we wrapped around to the top of the round
                let nextRound = state.currentRound;
                if (updatedCombatants.length > 1) {
                    // Find the absolute highest initiative score currently on the board
                    const highestInit = Math.max(...updatedCombatants.map(c => c.initiativeRoll));
                    // If the guy who just rotated to the top has that highest score, it's a new round!
                    if (updatedCombatants[0].initiativeRoll === highestInit) {
                        nextRound += 1;
                    }
                }

                return {
                    combatants: updatedCombatants,
                    activeCombatantIndex: 0, // Always 0 in a carousel!
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