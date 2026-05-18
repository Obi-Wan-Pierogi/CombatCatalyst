import React, { useState } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AddPlayerModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { addCombatant } = useCombatEngine();

    const [name, setName] = useState('');
    const [maxHp, setMaxHp] = useState<number | ''>('');
    const [armorClass, setArmorClass] = useState<number | ''>('');
    const [speed, setSpeed] = useState<number>(30);
    const [initiativeRoll, setInitiativeRoll] = useState<number | ''>('');
    const [isSurprised, setIsSurprised] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || maxHp === '' || armorClass === '' || initiativeRoll === '') return;

        const newPlayer: ActiveCombatant = {
            // Base Monster properties mocked for players
            name,
            size: 'Medium',
            type: 'humanoid',
            armorClass: Number(armorClass),
            hitPoints: Number(maxHp),
            speed: `${speed} ft.`,

            // Dynamic Engine State
            instanceId: crypto.randomUUID(),
            isPlayer: true,
            currentHp: Number(maxHp),
            maxHp: Number(maxHp),
            tempHp: 0,
            initiativeRoll: Number(initiativeRoll),

            // Death Saves & Legendary Actions (PCs don't usually have LA, default 0)
            deathSaveSuccesses: 0,
            deathSaveFailures: 0,
            legendaryActionsRemaining: 0,
            hasReactionAvailable: true,
            conditions: [],

            // Action Economy
            actionUsed: false,
            bonusActionUsed: false,
            movementRemaining: speed,
            speedInFeet: speed,
            isSurprised,
            isConcentrating: false
        };

        addCombatant(newPlayer);

        // Reset form and close
        setName('');
        setMaxHp('');
        setArmorClass('');
        setSpeed(30);
        setInitiativeRoll('');
        setIsSurprised(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6">

                <div className="border-b border-slate-800 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">Add Player Character</h2>
                    <p className="text-slate-400 text-sm">Manually enter a PC into the initiative order.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-1">Character Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Grog Strongjaw"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-1">Max HP</label>
                            <input
                                type="number"
                                required
                                value={maxHp}
                                onChange={(e) => setMaxHp(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-1">Armor Class</label>
                            <input
                                type="number"
                                required
                                value={armorClass}
                                onChange={(e) => setArmorClass(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-1">Initiative Roll</label>
                            <input
                                type="number"
                                required
                                value={initiativeRoll}
                                onChange={(e) => setInitiativeRoll(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-1">Speed (ft)</label>
                            <input
                                type="number"
                                required
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 mt-2 text-slate-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSurprised}
                            onChange={(e) => setIsSurprised(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                        />
                        Start combat Surprised?
                    </label>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded text-slate-300 hover:bg-slate-800 transition-colors font-semibold border border-transparent hover:border-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors font-bold shadow-lg"
                        >
                            Add Player
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};