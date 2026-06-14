import { useMemo } from 'react';
import { useCombatStore } from '../store/useCombatStore';
import type { ActiveCombatant } from '../types/combat';

/**
 * The Combat Engine Facade
 * Acts as a protective layer between the UI and the Zustand store.
 * Encapsulates dispatch actions into semantic functions to prevent raw state mutations
 * from bleeding into the presentation layer.
 */
export const useCombatEngine = () => {
    const combatants = useCombatStore((state) => state.combatants);
    const currentRound = useCombatStore((state) => state.currentRound);
    const activeCombatantIndex = useCombatStore((state) => state.activeCombatantIndex);
    const combatLog = useCombatStore((state) => state.combatLog);
    const isCombatStarted = useCombatStore((state) => state.isCombatStarted);
    const dispatch = useCombatStore((state) => state.dispatch);

    /**
     * Memoized active combatant derivation.
     * Prevents unnecessary re-renders in components relying on the active turn object
     * when unrelated state properties change.
     */
    const activeCombatant = useMemo(() => {
        return combatants[activeCombatantIndex] || null;
    }, [combatants, activeCombatantIndex]);

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
    };

    const applyHealing = (instanceId: string, amount: number) => {
        dispatch({ type: 'UPDATE_HP', payload: { instanceId, amount } });
    };

    const toggleCondition = (instanceId: string, condition: string) => {
        dispatch({ type: 'TOGGLE_CONDITION', payload: { instanceId, condition } });
    };

    const toggleConcentration = (instanceId: string) => {
        dispatch({ type: 'TOGGLE_CONCENTRATION', payload: instanceId });
    };

    /**
     * Executes the carousel rotation in the underlying state.
     * The combatant previously at index 0 is shifted to the end, making the combatant
     * at index 1 the new active entity.
     */
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

    return {
        combatants,
        currentRound,
        activeCombatantIndex,
        activeCombatant,
        combatLog,
        isCombatStarted,
        addCombatant,
        removeCombatant,
        applyDamage,
        applyHealing,
        toggleCondition,
        toggleConcentration,
        nextTurn,
        updateDeathSaves,
        resetCombat
    };
};