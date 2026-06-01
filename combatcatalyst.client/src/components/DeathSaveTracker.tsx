import React from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

interface Props {
    combatant: ActiveCombatant;
}

export const DeathSaveTracker: React.FC<Props> = ({ combatant }) => {
    const { updateDeathSaves } = useCombatEngine();

    const handleToggle = (type: 'success' | 'failure', index: number) => {
        let newSuccesses = combatant.deathSaveSuccesses;
        let newFailures = combatant.deathSaveFailures;

        if (type === 'success') {
            newSuccesses = (combatant.deathSaveSuccesses === index + 1) ? index : index + 1;
        } else {
            newFailures = (combatant.deathSaveFailures === index + 1) ? index : index + 1;
        }

        updateDeathSaves(combatant.instanceId, newSuccesses, newFailures);
    };

    return (
        <div className="bg-slate-950 p-3 rounded border border-slate-700 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-400">Successes</span>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <input
                            key={`s-${i}`}
                            type="checkbox"
                            checked={i < combatant.deathSaveSuccesses}
                            onChange={() => handleToggle('success', i)}
                            className="accent-green-600 h-4 w-4 cursor-pointer"
                        />
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400">Failures</span>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <input
                            key={`f-${i}`}
                            type="checkbox"
                            checked={i < combatant.deathSaveFailures}
                            onChange={() => handleToggle('failure', i)}
                            className="accent-red-600 h-4 w-4 cursor-pointer"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};