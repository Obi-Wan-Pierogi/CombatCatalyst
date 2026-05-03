import React, { useState } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

export const MonsterSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { addCombatant } = useCombatEngine();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Calls your C# backend proxy
            const response = await fetch(`/api/Monster/${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Monster not found or server error');

            const monster = await response.json();

            // Calculate standard D&D 5e Dexterity Modifier
            const dexMod = Math.floor((monster.dexterity - 10) / 2);
            const initiative = Math.floor(Math.random() * 20) + 1 + dexMod;

            const newCombatant: ActiveCombatant = {
                ...monster, // Inherit Open5e base stats
                instanceId: crypto.randomUUID(),
                isPlayer: false,
                maxHp: monster.hit_points,
                currentHp: monster.hit_points,
                tempHp: 0,
                armorClass: monster.armor_class,
                initiativeRoll: initiative,
                deathSaveSuccesses: 0,
                deathSaveFailures: 0,
                legendaryActionsRemaining: 3,
                hasReactionAvailable: true,
                conditions: []
            };

            addCombatant(newCombatant);
            setSearchTerm('');
        } catch (err) {
            setError('Failed to pull monster data. Check C# server connection.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
            <h2 className="text-lg font-bold text-white mb-3">Add Combatant</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Open5e (e.g., Goblin)"
                    className="flex-1 bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    disabled={isLoading || !searchTerm.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded text-white font-semibold transition-colors"
                >
                    {isLoading ? 'Rolling...' : 'Roll Initiative'}
                </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
};