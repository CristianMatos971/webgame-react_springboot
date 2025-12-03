import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as PIXI from 'pixi.js';

function GameCanvas() {
    const containerRef = useRef(null);
    const appRef = useRef(null);
    const gameRendererRef = useRef(null);

    // Navigation hooks 
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        const playerName = location.state?.playerName;
        if (!playerName) {
            navigate('/');
            return;
        }

        // Flag to prevent multiple initializations
        let isMounted = true;

        const initGame = async () => {
            // stops here if already initialized
            if (appRef.current) return;

            try {
                const app = new PIXI.Application();

                await app.init({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    backgroundColor: 0x1d1d1d,
                    antialias: false,
                    resolution: window.devicePixelRatio || 1,
                    resizeTo: window
                });

                // safeguard in case component unmounted during async operations
                if (!isMounted) {
                    app.destroy(true);
                    return;
                }

                appRef.current = app;

                if (containerRef.current) {
                    // clear possible safeguard canvas
                    containerRef.current.innerHTML = '';
                    containerRef.current.appendChild(app.canvas);
                }

                if (containerRef.current) {
                    containerRef.current.appendChild(app.canvas);
                }

                // load GameRenderer dynamically
                const GameRendererModule = await import("../game/engine/GameRenderer");

                // second safeguard
                if (!isMounted) return;

                const RendererClass = GameRendererModule.default;

                gameRendererRef.current = new RendererClass(app);

                console.log(`Starting game for player: ${playerName}`);
                gameRendererRef.current = new GameRenderer(app, playerName);

            } catch (error) {
                console.error("Failed to initialize game:", error);
            }
        };

        initGame();

        // Cleanup
        return () => {

            isMounted = false;

            if (appRef.current) {
                // destroy PixiJS app and its children
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
            }
            if (gameRendererRef.current) {
                if (gameRendererRef.current.destroy) {
                    gameRendererRef.current.destroy();
                }
                gameRendererRef.current = null;
            }
        };
    }, []);

    // Render the container for PixiJS
    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        />
    );
}

export default GameCanvas;