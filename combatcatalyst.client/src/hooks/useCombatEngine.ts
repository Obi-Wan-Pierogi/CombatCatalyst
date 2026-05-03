import { useMemo } from 'react';
import { useCombatStore } from '../store/useCombatStore';
import type { ActiveCombatant } from '../types/combat';

/**
 * The Combat Engine Facade
 * Acts as a protective layer between the UI and the Zustand store.
 */
export const useCombatEngine = () => {
    // 1. Extract State
    const combatants = useCombatStore((state) => state.combatants);
    const currentRound = useCombatStore((state) => state.currentRound);
    const activeCombatantIndex = useCombatStore((state) => state.activeCombatantIndex);
    const combatLog = useCombatStore((state) => state.combatLog);
    const isCombatStarted = useCombatStore((state) => state.isCombatStarted);
    const dispatch = useCombatStore((state) => state.dispatch);

    // 2. Derived State
    // We use useMemo to ensure activeCombatant only recalculates if the dependencies change
    const activeCombatant = useMemo(() => {
        return combatants[activeCombatantIndex] || null;
    }, [combatants, activeCombatantIndex]);

    // 3. Wrapper Functions (The Shield)
    const addCombatant = (combatant: ActiveCombatant) => {
        dispatch({ type: 'ADD_COMBATANT', payload: combatant });
        dispatch({ type: 'LOG_EVENT', payload: `Added ${combatant.name} to the fray.` });
    };

    const removeCombatant = (instanceId: string) => {
        const target = combatants.find(c => c.instanceId === instanceId);
        dispatch({ type: 'REMOVE_COMBATANT', payload: instanceId });
        if (target) {
            dispatch({ type: 'LOG_EVENT', payload: `${target.name} was removed from combat.` });
        }
    };

    const applyDamage = (instanceId: string, amount: number) => {
        dispatch({ type: 'UPDATE_HP', payload: { instanceId, amount: -amount } });
        // Note: Logging for damage/healing is usually handled here for cleaner UI components
    };

    const applyHealing = (instanceId: string, amount: number) => {
        dispatch({ type: 'UPDATE_HP', payload: { instanceId, amount } });
    };

    const toggleCondition = (instanceId: string, condition: string) => {
        dispatch({ type: 'TOGGLE_CONDITION', payload: { instanceId, condition } });
    };

    const nextTurn = () => {
        dispatch({ type: 'NEXT_TURN' });
        const nextUp = combatants[(activeCombatantIndex + 1) % combatants.length];
        if (nextUp) {
            dispatch({ type: 'LOG_EVENT', payload: `Turn passed to ${nextUp.name}.` });
        }
    };

    const updateDeathSaves = (instanceId: string, successes: number, failures: number) => {
        dispatch({ type: 'UPDATE_DEATH_SAVES', payload: { instanceId, successes, failures } });
    };

    const resetCombat = () => {
        if (window.confirm("Are you sure you want to clear the entire combat?")) {
            dispatch({ type: 'RESET_COMBAT' });
            dispatch({ type: 'LOG_EVENT', payload: "--- Combat Reset ---" });
        }
    };

    // 4. Return Object
    return {
        // State Variables
        combatants,
        currentRound,
        activeCombatantIndex,
        activeCombatant,
        combatLog,
        isCombatStarted,

        // Wrapper Functions
        addCombatant,
        removeCombatant,
        applyDamage,
        applyHealing,
        toggleCondition,
        nextTurn,
        updateDeathSaves,
        resetCombat
    };
};