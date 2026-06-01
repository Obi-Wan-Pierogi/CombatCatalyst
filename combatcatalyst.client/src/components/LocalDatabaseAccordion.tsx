import React, { useState, useEffect } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

interface DatabaseMonster {
    id?: number | string;
    slug?: string;
    name: string;
    dexterity: number;
    size?: string;
    type?: string;
    armor_class?: number;
    armorClass?: number;
    hit_points?: number;
    hitPoints?: number;
    speed?: string | { walk?: string };
    [key: string]: unknown;
}

const rollInitiative = (dexterity: number): number => {
    const dexMod = Math.floor((dexterity - 10) / 2);
    return Math.floor(Math.random() * 20) + 1 + dexMod;
};

export const LocalDatabaseAccordion: React.FC = () => {
    const { addCombatant } = useCombatEngine();
    const [isExpanded, setIsExpanded] = useState(true);
    const [cachedMonsters, setCachedMonsters] = useState<DatabaseMonster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Note: We expose a function to re-fetch so it stays updated
    const fetchLocalMonsters = async () => {
        try {
            const response = await fetch('/api/Monster', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                setCachedMonsters(data);
            }
        } catch (error) {
            console.error("Failed to fetch local database monsters:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchLocalMonsters = async () => {
            try {
                const response = await fetch('/api/Monster');

                // Defensive check: Only try to parse if the server explicitly says it's JSON
                const contentType = response.headers.get("content-type");
                if (response.ok && contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    setCachedMonsters(data);
                } else if (response.ok) {
                    console.warn("Server returned success, but it wasn't JSON data. Check C# routing.");
                }
            } catch (error) {
                console.error("Failed to fetch local database monsters:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocalMonsters();
    }, []);

    const handleQuickAdd = (monster: DatabaseMonster) => {
        const initiative = rollInitiative(monster.dexterity || 10);

        let speedStr = '30';
        if (typeof monster.speed === 'string') {
            speedStr = monster.speed;
        } else if (monster.speed && typeof monster.speed === 'object' && 'walk' in monster.speed) {
            speedStr = String(monster.speed.walk);
        }
        const parsedSpeed = parseInt(speedStr) || 30;

        const newCombatant = {
            ...monster,
            instanceId: crypto.randomUUID(),
            isPlayer: false,
            size: typeof monster.size === 'string' ? monster.size : 'Medium',
            type: typeof monster.type === 'string' ? monster.type : 'Unknown',
            armorClass: monster.armor_class || monster.armorClass || 10,
            currentHp: monster.hit_points || monster.hitPoints || 10,
            maxHp: monster.hit_points || monster.hitPoints || 10,
            tempHp: 0,
            initiativeRoll: initiative,
            deathSaveSuccesses: 0,
            deathSaveFailures: 0,
            legendaryActionsRemaining: 3,
            hasReactionAvailable: true,
            conditions: [],
            actionUsed: false,
            bonusActionUsed: false,
            movementRemaining: parsedSpeed,
            speedInFeet: parsedSpeed,
            isSurprised: false,
            isConcentrating: false
        } as ActiveCombatant;

        addCombatant(newCombatant);
    };

    const handleDelete = async (e: React.MouseEvent, monsterId: string | number | undefined) => {
        e.stopPropagation();
        if (!monsterId) return;

        // Browser confirmation prompt
        if (!window.confirm('Are you sure you want to permanently delete this monster from your Bestiary?')) {
            return;
        }

        try {
            const response = await fetch(`/api/Monster/${monsterId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove it from the UI immediately
                setCachedMonsters(prev => prev.filter(m => m.id !== monsterId && m.slug !== monsterId));
            } else {
                console.error("Server refused deletion.");
            }
        } catch (error) {
            console.error("Failed to delete monster:", error);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-slate-800 hover:bg-slate-750 transition-colors w-full border-b border-slate-700">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-1 p-4 flex justify-between items-center text-left"
                >
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>📚</span> Local Bestiary
                    </h2>
                    <span className="text-slate-400 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                    </span>
                </button>
                <button
                    onClick={fetchLocalMonsters}
                    className="px-4 text-sm text-blue-400 hover:text-blue-300 font-semibold border-l border-slate-700 h-full"
                    title="Refresh Bestiary"
                >
                    ↻
                </button>
            </div>

            {isExpanded && (
                <div className="p-4 bg-slate-900/50 flex-1 max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-slate-400 text-sm text-center">Loading bestiary...</p>
                    ) : cachedMonsters.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center italic">No monsters saved locally.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {cachedMonsters.map((monster, index) => {
                                // Ensure we have an identifier to delete by (EF Core usually uses 'id', Open5e uses 'slug')
                                const identifier = monster.id || monster.slug;

                                return (
                                    <li key={identifier || index} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                                        <div>
                                            <span className="font-semibold text-slate-200 block text-sm">{monster.name}</span>
                                            <span className="text-xs text-slate-500">AC: {monster.armor_class || monster.armorClass}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleQuickAdd(monster)}
                                                className="text-xs bg-slate-700 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors font-bold"
                                            >
                                                + Add
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, identifier)}
                                                className="text-xs border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-red-100 px-2 py-1 rounded transition-colors font-bold"
                                                title="Delete from Bestiary"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};