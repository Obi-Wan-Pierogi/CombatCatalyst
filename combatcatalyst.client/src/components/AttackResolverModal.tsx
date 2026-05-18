import React, { useState } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    attackerId: string;
    defenderId: string;
}

export const AttackResolverModal: React.FC<Props> = ({ isOpen, onClose, attackerId, defenderId }) => {
    const { combatants, applyDamage } = useCombatEngine();

    const [coverBonus, setCoverBonus] = useState<number>(0);
    const [positioning, setPositioning] = useState<string>('Normal');
    const [attackRoll, setAttackRoll] = useState<number | ''>('');
    const [damageAmount, setDamageAmount] = useState<number | ''>('');

    if (!isOpen) return null;

    const attacker = combatants.find(c => c.instanceId === attackerId);
    const defender = combatants.find(c => c.instanceId === defenderId);

    if (!attacker || !defender) return null;

    const effectiveAC = defender.armorClass + coverBonus;
    const isHit = typeof attackRoll === 'number' && attackRoll >= effectiveAC;

    const handleConfirm = () => {
        if (isHit && typeof damageAmount === 'number') {
            applyDamage(defenderId, damageAmount);
        }
        // Reset state for next time
        setCoverBonus(0);
        setPositioning('Normal');
        setAttackRoll('');
        setDamageAmount('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6">

                {/* Header */}
                <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-xl font-bold text-white">Resolve Attack</h2>
                    <p className="text-slate-400 text-sm">
                        <span className="text-orange-400 font-semibold">{attacker.name}</span> is attacking <span className="text-blue-400 font-semibold">{defender.name}</span>
                    </p>
                </div>

                {/* Modifiers Section */}
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-1">Target Cover</label>
                        <select
                            value={coverBonus}
                            onChange={(e) => setCoverBonus(Number(e.target.value))}
                            className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value={0}>None (Base AC: {defender.armorClass})</option>
                            <option value={2}>Half Cover (+2 AC)</option>
                            <option value={5}>Three-Quarters Cover (+5 AC)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-1">Positioning (Context)</label>
                        <div className="flex gap-4 bg-slate-800 p-2 rounded border border-slate-700">
                            {['Normal', 'Advantage', 'Disadvantage'].map(pos => (
                                <label key={pos} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="positioning"
                                        value={pos}
                                        checked={positioning === pos}
                                        onChange={(e) => setPositioning(e.target.value)}
                                        className="text-orange-500 bg-slate-900 border-slate-700 focus:ring-orange-500"
                                    />
                                    {pos}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-1">
                            Attack Roll Total <span className="text-slate-500 font-normal">(vs AC {effectiveAC})</span>
                        </label>
                        <input
                            type="number"
                            value={attackRoll}
                            onChange={(e) => setAttackRoll(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Enter d20 + modifiers..."
                            className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                </div>

                {/* Resolution Section */}
                <div className={`p-4 rounded-lg border transition-colors ${typeof attackRoll !== 'number' ? 'border-slate-800 bg-slate-800/50' : isHit ? 'border-green-600/50 bg-green-900/20' : 'border-slate-600 bg-slate-800'}`}>
                    {typeof attackRoll !== 'number' ? (
                        <p className="text-slate-500 text-center text-sm italic">Awaiting attack roll...</p>
                    ) : !isHit ? (
                        <div className="text-center">
                            <span className="text-2xl font-bold text-slate-400">MISS!</span>
                            <p className="text-slate-500 text-sm mt-1">Roll {attackRoll} does not beat AC {effectiveAC}.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="text-center">
                                <span className="text-2xl font-bold text-green-400">HIT!</span>
                                <p className="text-green-500/70 text-sm">Roll {attackRoll} beats AC {effectiveAC}.</p>
                            </div>
                            <div>
                                <label className="block text-green-200 text-sm font-semibold mb-1">Damage Amount</label>
                                <input
                                    type="number"
                                    value={damageAmount}
                                    onChange={(e) => setDamageAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Enter damage..."
                                    className="w-full bg-slate-900 text-white border border-green-800 rounded p-2 font-bold focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded text-slate-300 hover:bg-slate-800 transition-colors font-semibold border border-transparent hover:border-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isHit || damageAmount === ''}
                        className="flex-1 py-2 rounded text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shadow-lg"
                    >
                        Confirm & Apply
                    </button>
                </div>
            </div>
        </div>
    );
};