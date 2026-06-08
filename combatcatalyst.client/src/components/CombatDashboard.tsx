import React, { useState } from 'react';
import { useCombatEngine } from '../hooks/useCombatEngine';
import { MonsterSearch } from './MonsterSearch';
import { CombatantCard } from './CombatantCard';
import { AddPlayerModal } from './AddPlayerModal';
import { LocalDatabaseAccordion } from './LocalDatabaseAccordion';

export const CombatDashboard: React.FC = () => {
    const { combatants, currentRound, activeCombatantIndex, nextTurn, resetCombat } = useCombatEngine();

    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 p-4 lg:p-6 font-sans overflow-x-hidden relative">
            <div className="w-full flex flex-col gap-6">

                {/* Mobile Header */}
                <header className="mb-4 lg:mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                            The Combat Catalyst
                        </h1>
                        <p className="text-slate-400 text-sm lg:text-base">Encounter Management Engine</p>
                    </div>

                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="block lg:hidden text-slate-300 hover:text-white p-2 rounded bg-slate-800 border border-slate-700"
                    >
                        <span className="text-2xl leading-none">☰</span>
                    </button>
                </header>

                {/* Main Flex Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start relative">

                    {/* Overlay for Mobile Sidebar */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar (Left Column) */}
                    <div className={`fixed inset-y-0 left-0 z-40 w-96 transform bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-96 lg:shrink-0 lg:z-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="block lg:hidden self-end text-slate-400 hover:text-white font-bold mb-2"
                        >
                            Close ✕
                        </button>

                        <MonsterSearch />

                        <button
                            onClick={() => setIsPlayerModalOpen(true)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 hover:border-blue-500 border-dashed py-2 rounded font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <span>+</span> Add Player Character
                        </button>

                        <LocalDatabaseAccordion />

                        {/* Encounter Status block */}
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md mt-auto lg:mt-0">
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
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 rounded text-white font-bold text-lg transition-colors shadow-lg shadow-green-900/20"
                                >
                                    {activeCombatantIndex === combatants.length - 1 ? 'End Round ➔' : 'Next Turn ➔'}
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

                    {/* Right Column (Initiative Tracker) */}
                    <div className="flex-1 w-full">
                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 min-h-[500px] shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>⚔️</span> Initiative Order
                            </h2>

                            {combatants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                                    <p className="text-lg mb-2">The battlefield is quiet.</p>
                                    <p className="text-sm">Search or use the Bestiary to begin.</p>
                                </div>
                            ) : (
                                <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-4 items-start">
                                    {combatants.map((combatant, index) => (
                                        <CombatantCard
                                            key={combatant.instanceId}
                                            combatant={combatant}
                                            isActiveTurn={index === 0}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <AddPlayerModal
                isOpen={isPlayerModalOpen}
                onClose={() => setIsPlayerModalOpen(false)}
            />

        </div>
    );
};