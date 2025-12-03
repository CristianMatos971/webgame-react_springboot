import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainMenu() {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();

        // Validation: remove whitespace and check for empty string
        if (!name.trim()) return;

        // Navigate to the game route, passing the name via router state
        navigate('/play', { state: { playerName: name } });
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>ConquerQuest</h1>
                <p style={styles.subtitle}>Survival MMORPG</p>

                <form onSubmit={handleJoin} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Enter your hero name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                        maxLength={12}
                    />
                    <button type="submit" style={styles.button}>
                        PLAY NOW
                    </button>
                </form>
            </div>
        </div>
    );
}

// Basic CSS-in-JS styles (Dark Theme)
const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'sans-serif',
        overflow: 'hidden' // Ensure menu doesn't cause scroll
    },
    card: {
        backgroundColor: '#2d2d2d',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
        textAlign: 'center',
        width: '300px'
    },
    title: {
        margin: '0 0 10px 0',
        color: '#e62731',
        fontSize: '32px'
    },
    subtitle: {
        color: '#888',
        marginTop: 0,
        marginBottom: '30px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    input: {
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #444',
        backgroundColor: '#3d3d3d',
        color: 'white',
        fontSize: '16px',
        outline: 'none'
    },
    button: {
        padding: '12px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '16px',
        transition: '0.2s'
    }
};

export default MainMenu;