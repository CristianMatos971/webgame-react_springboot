import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { User, Swords } from 'lucide-react';

export default function MainMenu() {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        navigate('/play', { state: { playerName: name } });
    };

    return (
        <div className="relative flex items-center justify-center w-full h-screen bg-neutral-900 text-white overflow-hidden font-sans selection:bg-red-500 selection:text-white">

            {/* Background Decorativo (Grid Pattern) */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Card Principal */}
            <div className="relative z-10 w-full max-w-sm p-8 bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-700/50 backdrop-blur-sm">

                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-red-500 tracking-wide drop-shadow-md mb-2 flex items-center justify-center gap-2">
                        <Swords className="w-8 h-8" />
                        ConquerQuest
                    </h1>
                    <p className="text-neutral-400 text-sm font-medium tracking-widest uppercase">
                        Survival MMORPG
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleJoin} className="flex flex-col gap-5">
                    <div className="relative group">
                        {/* Ícone dentro do input */}
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-red-400 transition-colors">
                            <User size={20} />
                        </div>

                        <input
                            type="text"
                            placeholder="Enter your hero name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={12}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 
                                     focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                                     transition-all duration-200 ease-in-out"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed
                                 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/20 
                                 transform hover:-translate-y-0.5 active:translate-y-0
                                 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        PLAY NOW
                    </button>
                </form>
            </div>

            {/* Rodapé de versão (opcional) */}
            <div className="absolute bottom-4 text-neutral-600 text-xs">
                v0.1.0-alpha
            </div>
        </div>
    );
}



