import React from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

interface Props {
    combatant: ActiveCombatant;
    isActiveTurn: boolean;
}

export const CombatantCard: React.FC<Props> = ({ combatant, isActiveTurn }) => {
    const { applyDamage, applyHealing, removeCombatant } = useCombatEngine();

    const isDead = combatant.currentHp <= 0;

    // Upgraded Active Highlight: Glowing green ring instead of just a border
    const highlightStyle = isActiveTurn
        ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.4)] bg-slate-800'
        : 'border border-slate-700 bg-slate-900/50';

    return (
        // Added 'relative' and 'overflow-hidden' to contain the death overlay
        <div className={`relative p-4 rounded-lg flex flex-col gap-3 transition-all duration-300 ${highlightStyle} overflow-hidden`}>

            {/* ☠️ The Death Overlay */}
            {isDead && (
                <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-7xl opacity-60 drop-shadow-lg">☠️</span>
                </div>
            )}

            {/* Card Header */}
            <div className="flex justify-between items-start relative z-20">
                <div>
                    <h3 className={`text-xl font-bold ${isDead ? 'text-red-400' : 'text-white'}`}>
                        {combatant.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Init: <span className="font-semibold text-white">{combatant.initiativeRoll}</span> |
                        AC: <span className="font-semibold text-white">{combatant.armorClass}</span>
                    </p>
                </div>
                <button
                    onClick={() => removeCombatant(combatant.instanceId)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50 text-sm px-2 py-1 rounded transition-colors pointer-events-auto"
                    title="Remove from combat"
                >
                    ✕
                </button>
            </div>

            {/* Health Controls */}
            <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded relative z-20">
                <div className="text-white font-mono">
                    HP: <span className={isDead ? 'text-red-500 font-bold' : 'text-green-400 font-bold'}>
                        {combatant.currentHp}
                    </span> / {combatant.maxHp}
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => applyDamage(combatant.instanceId, 5)}
                        className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1 rounded font-bold border border-red-800/50 transition-colors"
                    >
                        -5
                    </button>
                    <button
                        onClick={() => applyHealing(combatant.instanceId, 5)}
                        className="bg-green-900/50 hover:bg-green-800 text-green-200 px-3 py-1 rounded font-bold border border-green-800/50 transition-colors"
                    >
                        +5
                    </button>
                </div>
            </div>
        </div>
    );
};