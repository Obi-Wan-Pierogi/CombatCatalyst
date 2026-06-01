import React, { useState, useEffect } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface SavedPlayer {
    id: number;
    name: string;
    armorClass: number;
    maxHp: number;
    initiativeBonus: number;
}

const rollPlayerInitiative = (bonus: number): number => {
    return Math.floor(Math.random() * 20) + 1 + bonus;
};

export const AddPlayerModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { addCombatant } = useCombatEngine();

    // Roster State
    const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [ac, setAc] = useState<number | ''>('');
    const [hp, setHp] = useState<number | ''>('');
    const [initBonus, setInitBonus] = useState<number | ''>('');
    const [manualInitTotal, setManualInitTotal] = useState<number | ''>('');
    const [saveToRoster, setSaveToRoster] = useState(true);

    // Safely isolated useEffect to completely satisfy the linter
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        const fetchPlayers = async () => {
            try {
                const response = await fetch('/api/Player', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    // Only update state if the modal is still open
                    if (isMounted) {
                        setSavedPlayers(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch players", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPlayers();

        // Cleanup function to prevent memory leaks if closed mid-fetch
        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    const deletePlayer = async (id: number) => {
        if (!window.confirm("Remove this character from your saved roster?")) return;
        try {
            const response = await fetch(`/api/Player/${id}`, { method: 'DELETE' });
            if (response.ok) setSavedPlayers(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete player", error);
        }
    };

    const handleQuickAdd = (player: SavedPlayer) => {
        const rolledInit = rollPlayerInitiative(player.initiativeBonus);
        injectToEngine(player.name, player.armorClass, player.maxHp, rolledInit);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || ac === '' || hp === '' || manualInitTotal === '') return;

        if (saveToRoster && initBonus !== '') {
            try {
                await fetch('/api/Player', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, armorClass: ac, maxHp: hp, initiativeBonus: initBonus })
                });
            } catch (err) {
                console.error("Failed to save player to DB", err);
            }
        }

        injectToEngine(name, Number(ac), Number(hp), Number(manualInitTotal));

        // Reset Form
        setName(''); setAc(''); setHp(''); setInitBonus(''); setManualInitTotal('');
        onClose();
    };

    const injectToEngine = (pcName: string, pcAc: number, pcHp: number, pcInit: number) => {
        const newPc = {
            instanceId: crypto.randomUUID(),
            name: pcName,
            isPlayer: true,
            size: 'Medium',
            type: 'Humanoid',
            speed: '30 ft.',
            hit_points: pcHp,
            hitPoints: pcHp,
            armorClass: pcAc,
            maxHp: pcHp,
            currentHp: pcHp,
            tempHp: 0,
            initiativeRoll: pcInit,
            deathSaveSuccesses: 0,
            deathSaveFailures: 0,
            legendaryActionsRemaining: 0,
            hasReactionAvailable: true,
            conditions: [],
            actionUsed: false,
            bonusActionUsed: false,
            movementRemaining: 30,
            speedInFeet: 30,
            isSurprised: false,
            isConcentrating: false
        } as ActiveCombatant;

        addCombatant(newPc);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col my-auto">

                <div className="border-b border-slate-800 p-6 flex justify-between items-center bg-slate-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">🛡️</span> Add Player Character
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Saved Roster */}
                    <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Saved Roster</h3>
                        {isLoading ? (
                            <p className="text-slate-500 text-sm italic">Loading party...</p>
                        ) : savedPlayers.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">No players saved yet. Create one on the right to start your roster.</p>
                        ) : (
                            <ul className="flex flex-col gap-3 overflow-y-auto max-h-72 pr-2">
                                {savedPlayers.map(player => (
                                    <li key={player.id} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-blue-200">{player.name}</span>
                                            <button onClick={() => deletePlayer(player.id)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-slate-400">AC: {player.armorClass} | HP: {player.maxHp} | Init: {player.initiativeBonus >= 0 ? `+${player.initiativeBonus}` : player.initiativeBonus}</span>
                                            <button
                                                onClick={() => { handleQuickAdd(player); onClose(); }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors"
                                            >
                                                Roll & Add
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Right Column: Add New PC */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Add Manual PC</h3>
                        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Character Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Armor Class</label>
                                    <input type="number" min={0} required value={ac} onChange={e => setAc(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max HP</label>
                                    <input type="number" min={1} required value={hp} onChange={e => setHp(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Rolled Init.</label>
                                    <input type="number" required value={manualInitTotal} onChange={e => setManualInitTotal(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 14" className="w-full bg-slate-900 text-blue-200 border border-blue-900 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Base Init. Bonus</label>
                                    <input type="number" disabled={!saveToRoster} required={saveToRoster} value={initBonus} onChange={e => setInitBonus(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 2" className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input type="checkbox" checked={saveToRoster} onChange={e => setSaveToRoster(e.target.checked)} className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                                <span className="text-sm text-slate-300">Save to Roster for future encounters</span>
                            </label>

                            <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-bold py-3 rounded mt-2 transition-colors">
                                Add to Initiative
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};