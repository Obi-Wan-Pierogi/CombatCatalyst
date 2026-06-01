import React, { useState, memo } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import { AttackResolverModal } from './AttackResolverModal';
import { CONDITION_DESCRIPTIONS } from '../data/conditions';
import { DeathSaveTracker } from './DeathSaveTracker';
import type { ActiveCombatant } from '../types/combat';

interface Props {
    combatant: ActiveCombatant;
    isActiveTurn: boolean;
}

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

    const isDead = combatant.currentHp <= 0;

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
            {/* UX Update: Removed overflow-hidden so tooltips can render outside the card boundary */}
            <div className={`relative p-4 rounded-lg flex flex-col gap-3 transition-all duration-300 ${highlightStyle}`}>

                {/* UX Update: Added rounded-lg to overlay since the parent no longer clips overflow */}
                {isDead && (
                    <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none rounded-lg">
                        <span className="text-7xl opacity-60 drop-shadow-lg">☠️</span>
                    </div>
                )}

                <div className="flex justify-between items-start relative z-20">
                    <div>
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDead ? 'text-red-400' : 'text-white'}`}>
                            {combatant.name}
                            {combatant.isPlayer && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                                    Player
                                </span>
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
                                className="text-orange-400 border border-orange-900/50 hover:bg-orange-950/50 text-xs px-2 py-1 rounded transition-colors pointer-events-auto"
                                title="Target with Attack"
                            >
                                🎯 Target
                            </button>
                        )}
                        <button
                            onClick={() => removeCombatant(combatant.instanceId)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/50 text-sm px-2 py-1 rounded transition-colors pointer-events-auto"
                            title="Remove from combat"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Updated HP Controls and Death Save Logic */}
                <div className="flex flex-col gap-2 bg-slate-950/50 p-2 rounded relative z-20 mt-1">
                    <div className="flex justify-between items-center">
                        <div className="text-white font-mono">
                            HP: <span className={isDead ? 'text-red-500 font-bold' : 'text-green-400 font-bold'}>
                                {combatant.currentHp}
                            </span> / {combatant.maxHp}
                        </div>

                        {/* Standard controls for NPCs or alive PCs */}
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

                    {/* Death Save Tracker only for downed Player Characters */}
                    {combatant.isPlayer && isDead && (
                        <DeathSaveTracker combatant={combatant} />
                    )}
                </div>

                <div className="flex flex-col gap-2 relative z-20 pointer-events-auto mt-1 border-t border-slate-800 pt-3">
                    <div className="flex gap-2 items-center">
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

                                    {/* UX Update: Centered width and high z-index to avoid clipping */}
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