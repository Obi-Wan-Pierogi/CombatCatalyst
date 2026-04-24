import { useState } from 'react';

// 1. The TypeScript Interface (Your "Contract" with the C# Backend)
// Notice how the property names match the JSON from Open5e exactly.
interface Monster {
    name: string;
    size: string;
    type: string;
    alignment: string;
    armor_class: number;
    hit_points: number;
    hit_dice: string;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

function App() {
    // 2. React State Management
    const [searchTerm, setSearchTerm] = useState('');
    const [monster, setMonster] = useState<Monster | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 3. The Fetch Function
    const searchMonster = async () => {
        if (!searchTerm) return;

        setLoading(true);
        setError('');
        setMonster(null); // Clear previous results

        try {
            // The Vite proxy you set up routes this directly to your C# MonsterController!
            const response = await fetch(`/api/Monster/${searchTerm.toLowerCase().replace(/\s+/g, '-')}`);

            if (!response.ok) {
                throw new Error(`Monster '${searchTerm}' not found. Try "goblin" or "ancient-red-dragon".`);
            }

            const data: Monster = await response.json();
            setMonster(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. The User Interface
    return (
        <div style={{ padding: '40px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#2c3e50', textAlign: 'center' }}>The Combat Catalyst</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search monster (e.g., Aboleth)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchMonster()}
                    style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={searchMonster}
                    disabled={loading}
                    style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Searching...' : 'Roll Initiative!'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {/* The Monster Stat Block */}
            {monster && (
                <div style={{ border: '2px solid #34495e', borderRadius: '8px', padding: '20px', backgroundColor: '#fdfdfd', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#8e44ad', fontSize: '28px' }}>{monster.name}</h2>
                    <p style={{ margin: '0 0 15px 0', fontStyle: 'italic', color: '#7f8c8d' }}>
                        {monster.size} {monster.type}, {monster.alignment}
                    </p>

                    <div style={{ borderTop: '2px solid #e74c3c', borderBottom: '2px solid #e74c3c', padding: '10px 0', marginBottom: '15px' }}>
                        <p style={{ margin: '5px 0' }}><strong>Armor Class:</strong> {monster.armor_class}</p>
                        <p style={{ margin: '5px 0' }}><strong>Hit Points:</strong> {monster.hit_points} ({monster.hit_dice})</p>
                    </div>

                    {/* Ability Scores Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                        <div><strong style={{ display: 'block', color: '#c0392b' }}>STR</strong> {monster.strength}</div>
                        <div><strong style={{ display: 'block', color: '#c0392b' }}>DEX</strong> {monster.dexterity}</div>
                        <div><strong style={{ display: 'block', color: '#c0392b' }}>CON</strong> {monster.constitution}</div>
                        <div><strong style={{ display: 'block', color: '#2980b9' }}>INT</strong> {monster.intelligence}</div>
                        <div><strong style={{ display: 'block', color: '#2980b9' }}>WIS</strong> {monster.wisdom}</div>
                        <div><strong style={{ display: 'block', color: '#2980b9' }}>CHA</strong> {monster.charisma}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;