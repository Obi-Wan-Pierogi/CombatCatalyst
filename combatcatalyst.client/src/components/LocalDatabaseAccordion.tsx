import React, { useState, useEffect } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import type { ActiveCombatant } from '../types/combat';

// 1. We create a strict interface to replace 'any'
interface DatabaseMonster {
    name: string;
    dexterity: number;
    armor_class?: number;
    armorClass?: number;
    hit_points?: number;
    hitPoints?: number;
    speed?: string | { walk?: string };
    // This allows the rest of the Open5e data to flow through without using 'any'
    [key: string]: unknown;
}

// 2. We move the random math OUTSIDE the component to satisfy the React Purity linter
const rollInitiative = (dexterity: number): number => {
    const dexMod = Math.floor((dexterity - 10) / 2);
    return Math.floor(Math.random() * 20) + 1 + dexMod;
};

export const LocalDatabaseAccordion: React.FC = () => {
    const { addCombatant } = useCombatEngine();
    const [isExpanded, setIsExpanded] = useState(true);

    // No more <any[]>
    const [cachedMonsters, setCachedMonsters] = useState<DatabaseMonster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLocalMonsters = async () => {
            try {
                const response = await fetch('/api/Monster');
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

        fetchLocalMonsters();
    }, []);

    // No more 'monster: any'
    const handleQuickAdd = (monster: DatabaseMonster) => {
        // Call our pure function from outside the component
        const initiative = rollInitiative(monster.dexterity);

        // Safely parse the speed string whether it's a string or an object
        let speedStr = '30';
        if (typeof monster.speed === 'string') {
            speedStr = monster.speed;
        } else if (monster.speed && typeof monster.speed === 'object' && 'walk' in monster.speed) {
            speedStr = String(monster.speed.walk);
        }
        const parsedSpeed = parseInt(speedStr) || 30;

        // We build the object and cast it as an ActiveCombatant at the very end
        const newCombatant = {
            ...monster,
            instanceId: crypto.randomUUID(),
            isPlayer: false,
            size: typeof monster.size === 'string' ? monster.size : 'Medium', // <-- FIX: Added fallback size
            type: typeof monster.type === 'string' ? monster.type : 'Unknown', // <-- FIX: Added fallback type
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

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-md overflow-hidden flex flex-col">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex justify-between items-center w-full p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
            >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📚</span> Local Bestiary
                </h2>
                <span className="text-slate-400 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                </span>
            </button>

            {isExpanded && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex-1 max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-slate-400 text-sm text-center">Loading bestiary...</p>
                    ) : cachedMonsters.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center italic">No monsters saved locally.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {cachedMonsters.map((monster, index) => (
                                <li key={index} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                                    <div>
                                        <span className="font-semibold text-slate-200 block text-sm">{monster.name}</span>
                                        <span className="text-xs text-slate-500">AC: {monster.armor_class || monster.armorClass}</span>
                                    </div>
                                    <button
                                        onClick={() => handleQuickAdd(monster)}
                                        className="text-xs bg-slate-700 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors font-bold"
                                    >
                                        + Add
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};