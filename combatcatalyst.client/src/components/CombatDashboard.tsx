import React from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import { MonsterSearch } from './MonsterSearch';
import { CombatantCard } from './CombatantCard';

export const CombatDashboard: React.FC = () => {
    const { combatants, currentRound, activeCombatantIndex, nextTurn, resetCombat } = useCombatEngine();

    return (
        <div className="min-h-screen bg-slate-950 p-6 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="mb-8 border-b border-slate-800 pb-4">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                        The Combat Catalyst
                    </h1>
                    <p className="text-slate-400">Encounter Management Engine</p>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Controls (4/12 width on large screens) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <MonsterSearch />

                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Encounter Status</h2>
                                <span className="bg-slate-900 text-orange-400 px-3 py-1 rounded-full font-bold">
                                    Round {currentRound}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={nextTurn}
                                    disabled={combatants.length === 0}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 rounded text-white font-bold text-lg transition-colors"
                                >
                                    Next Turn ➔
                                </button>
                                <button
                                    onClick={resetCombat}
                                    disabled={combatants.length === 0}
                                    className="bg-slate-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed w-full py-2 rounded text-slate-300 hover:text-white font-semibold transition-colors"
                                >
                                    Reset Encounter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Initiative Tracker (8/12 width on large screens) */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 min-h-[500px]">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>⚔️</span> Initiative Order
                            </h2>

                            {combatants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                                    <p className="text-lg mb-2">The battlefield is quiet.</p>
                                    <p className="text-sm">Search for a monster to begin the encounter.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {combatants.map((combatant, index) => (
                                        <CombatantCard
                                            key={combatant.instanceId}
                                            combatant={combatant}
                                            isActiveTurn={index === activeCombatantIndex}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};