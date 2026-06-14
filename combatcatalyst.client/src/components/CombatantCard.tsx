import React, { useState, memo } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import { AttackResolverModal } from './AttackResolverModal';
import { DeathSaveTracker } from './DeathSaveTracker';
import { CONDITION_DESCRIPTIONS } from '../data/conditions';
import type { ActiveCombatant } from '../types/combat';

interface Props {
    combatant: ActiveCombatant;
    isActiveTurn: boolean;
}

/**
 * Wrapped in React.memo for strict performance optimization.
 * Prevents the entire initiative grid from re-rendering when the global state updates,
 * ensuring only the specific combatant whose props changed (e.g., HP adjustment) triggers a DOM repaint.
 */
export const CombatantCard: React.FC<Props> = memo(({ combatant, isActiveTurn }) => {
    const {
        applyDamage,
        applyHealing,
        removeCombatant,
        activeCombatant,
        toggleCondition,
        toggleConcentration
    } = useCombatEngine();

    const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
    const [hpInput, setHpInput] = useState<number | ''>('');
    const [isStatsExpanded, setIsStatsExpanded] = useState(false);

    const isDead = combatant.currentHp <= 0;
    const isBloodied = !isDead && combatant.currentHp <= combatant.maxHp / 2;

    const highlightStyle = isActiveTurn
        ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.4)] bg-slate-800'
        : combatant.isPlayer
            ? 'border border-slate-700 border-l-4 border-l-blue-500 bg-slate-800/40'
            : 'border border-slate-700 border-l-4 border-l-orange-900/30 bg-slate-900/50';

    const handleDamage = () => {
        if (typeof hpInput === 'number' && hpInput > 0) {
            applyDamage(combatant.instanceId, hpInput);
            setHpInput('');
        }
    };

    const handleHeal = () => {
        if (typeof hpInput === 'number' && hpInput > 0) {
            applyHealing(combatant.instanceId, hpInput);
            setHpInput('');
        }
    };

    const handleConditionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const condition = e.target.value;
        if (condition) {
            toggleCondition(combatant.instanceId, condition);
            e.target.value = "";
        }
    };

    return (
        <>
            <div className={`relative p-4 rounded-lg flex flex-col h-full gap-3 transition-all duration-300 ${highlightStyle}`}>

                {isDead && (
                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 pointer-events-none rounded-lg">
                        <span className="text-7xl opacity-50 drop-shadow-lg mb-4">☠️</span>
                        {/* Elevated z-index with pointer-events-auto to intercept clicks above the shroud */}
                        <button
                            onClick={() => applyHealing(combatant.instanceId, 1)}
                            className="bg-green-900/90 hover:bg-green-700 text-green-100 font-bold py-1.5 px-5 rounded-full border border-green-600 shadow-2xl transition-colors pointer-events-auto"
                        >
                            Revive (1 HP)
                        </button>
                    </div>
                )}

                {/* Death saves are positioned at the absolute top of the visual hierarchy 
          and forced to z-40 to prevent layout overlap with the centralized Revive action. 
        */}
                {combatant.isPlayer && isDead && (
                    <div className="relative z-40 pointer-events-auto bg-slate-950/90 p-3 rounded-lg shadow-xl border border-slate-700 w-full mb-1">
                        <DeathSaveTracker combatant={combatant} />
                    </div>
                )}

                <div className="flex flex-wrap justify-between items-start relative gap-2">
                    <div className="flex-1 min-w-0 relative z-20">
                        <h3 className={`text-xl font-bold flex flex-wrap items-center gap-2 ${isDead ? 'text-red-400' : 'text-white'}`}>
                            {combatant.name}

                            {combatant.isPlayer && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                                    Player
                                </span>
                            )}

                            {!combatant.isPlayer && (
                                <button
                                    onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                                    className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded transition-colors"
                                >
                                    {isStatsExpanded ? 'Hide Stats ▲' : 'View Stats ▼'}
                                </button>
                            )}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Init: <span className="font-semibold text-white">{combatant.initiativeRoll}</span> |
                            AC: <span className="font-semibold text-white">{combatant.armorClass}</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {!isActiveTurn && !isDead && activeCombatant && (
                            <button
                                onClick={() => setIsAttackModalOpen(true)}
                                className="text-orange-400 border border-orange-900/50 hover:bg-orange-950/50 text-xs px-2 py-1 rounded transition-colors pointer-events-auto relative z-20"
                                title="Target with Attack"
                            >
                                🎯 Target
                            </button>
                        )}
                        <button
                            onClick={() => removeCombatant(combatant.instanceId)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/50 text-sm px-2 py-1 rounded transition-colors pointer-events-auto relative z-40"
                            title="Remove from combat"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between items-center bg-slate-950/50 p-2 rounded relative z-20 mt-1 gap-2">
                    <div className="text-white font-mono whitespace-nowrap">
                        HP: <span className={
                            isDead ? 'text-red-500 font-bold' :
                                isBloodied ? 'text-orange-500 font-bold' :
                                    'text-green-400 font-bold'
                        }>
                            {combatant.currentHp}
                        </span> / {combatant.maxHp}
                    </div>

                    {(!combatant.isPlayer || combatant.currentHp > 0) && (
                        <div className="flex gap-2 pointer-events-auto items-center">
                            <input
                                type="number"
                                min={0}
                                value={hpInput}
                                onChange={(e) => setHpInput(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                placeholder="0"
                                className="w-16 bg-slate-900 text-white text-center border border-slate-700 rounded py-1 px-2 focus:outline-none focus:border-blue-500 font-mono placeholder-slate-600"
                            />
                            <button
                                onClick={handleDamage}
                                disabled={hpInput === '' || hpInput <= 0}
                                className="bg-red-900/50 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 px-3 py-1 rounded font-bold border border-red-800/50 transition-colors"
                            >
                                DMG
                            </button>
                            <button
                                onClick={handleHeal}
                                disabled={hpInput === '' || hpInput <= 0}
                                className="bg-green-900/50 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-green-200 px-3 py-1 rounded font-bold border border-green-800/50 transition-colors"
                            >
                                HEAL
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 relative z-20 pointer-events-auto mt-1 border-t border-slate-800 pt-3">
                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            defaultValue=""
                            onChange={handleConditionSelect}
                            className="flex-1 min-w-0 bg-slate-900 text-slate-300 border border-slate-700 rounded py-1 px-2 text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                            <option value="" disabled>+ Add Condition...</option>
                            {Object.keys(CONDITION_DESCRIPTIONS).map(cond => (
                                <option key={cond} value={cond} disabled={combatant.conditions.includes(cond)}>
                                    {cond}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => toggleConcentration(combatant.instanceId)}
                            className={`px-3 py-1 rounded text-sm font-semibold border transition-colors ${combatant.isConcentrating
                                    ? 'bg-teal-900/60 border-teal-600 text-teal-200 hover:bg-teal-800/60'
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            {combatant.isConcentrating ? '★ Concentrating' : 'Concentration'}
                        </button>
                    </div>

                    {(combatant.conditions.length > 0 || combatant.isConcentrating) && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {combatant.isConcentrating && (
                                <div className="flex items-center gap-1 bg-teal-900 border border-teal-700 text-teal-100 px-2 py-0.5 rounded text-xs shadow-sm">
                                    <span>Concentrating</span>
                                    <button onClick={() => toggleConcentration(combatant.instanceId)} className="hover:text-white ml-1 font-bold">✕</button>
                                </div>
                            )}

                            {combatant.conditions.map(condition => (
                                <div key={condition} className="group relative flex items-center gap-1 bg-purple-900/80 border border-purple-700 text-purple-100 px-2 py-0.5 rounded text-xs shadow-sm cursor-help">
                                    <span>{condition}</span>
                                    <button
                                        onClick={() => toggleCondition(combatant.instanceId, condition)}
                                        className="hover:text-white ml-1 font-bold cursor-pointer"
                                    >
                                        ✕
                                    </button>

                                    {/* CSS-driven tooltip utilizing Tailwind group hover architecture */}
                                    <div className="hidden group-hover:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl text-xs text-slate-300 leading-relaxed whitespace-normal pointer-events-none">
                                        <strong className="text-purple-300 block mb-1">{condition}</strong>
                                        {CONDITION_DESCRIPTIONS[condition]}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isStatsExpanded && !combatant.isPlayer && (
                    <div className="mt-2 border-t border-slate-600 pt-3 bg-slate-900/80 rounded p-4 relative z-20 pointer-events-auto">

                        <div className="grid grid-cols-6 gap-2 text-center mb-4 border-b border-slate-700 pb-3">
                            {[
                                { label: 'STR', val: combatant.strength },
                                { label: 'DEX', val: combatant.dexterity },
                                { label: 'CON', val: combatant.constitution },
                                { label: 'INT', val: combatant.intelligence },
                                { label: 'WIS', val: combatant.wisdom },
                                { label: 'CHA', val: combatant.charisma }
                            ].map((stat) => {
                                const numVal = stat.val || 10;
                                const mod = Math.floor((numVal - 10) / 2);
                                const displayMod = mod >= 0 ? `+${mod}` : `${mod}`;

                                return (
                                    <div key={stat.label} className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400">{stat.label}</span>
                                        <span className="text-sm text-white font-semibold">{numVal}</span>
                                        <span className="text-[10px] text-slate-500">({displayMod})</span>
                                    </div>
                                );
                            })}
                        </div>

                        {combatant.special_abilities && combatant.special_abilities.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">
                                    Traits
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {combatant.special_abilities.map((ability, idx) => (
                                        <p key={idx} className="text-sm leading-relaxed">
                                            <span className="text-orange-400 font-semibold italic">{ability.name}. </span>
                                            <span className="text-slate-300">{ability.desc}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {combatant.actions && combatant.actions.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">
                                    Actions
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {combatant.actions.map((action, idx) => (
                                        <p key={idx} className="text-sm leading-relaxed">
                                            <span className="text-orange-400 font-semibold italic">{action.name}. </span>
                                            <span className="text-slate-300">{action.desc}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!combatant.special_abilities?.length && !combatant.actions?.length) && (
                            <p className="text-slate-500 text-sm italic text-center py-2">
                                No advanced stat block data available.
                            </p>
                        )}

                    </div>
                )}

            </div>

            {!isActiveTurn && activeCombatant && (
                <AttackResolverModal
                    isOpen={isAttackModalOpen}
                    onClose={() => setIsAttackModalOpen(false)}
                    attackerId={activeCombatant.instanceId}
                    defenderId={combatant.instanceId}
                />
            )}
        </>
    );
});