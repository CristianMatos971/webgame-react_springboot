import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socketClient } from "../game/network/SocketClient";
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
                    roundPixels: false,
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

                console.log("Fetching map from server...");
                const mapResponse = await fetch("http://localhost:8080/api/map");
                if (!mapResponse.ok) throw new Error("Failed to load map");

                const mapData = await mapResponse.json();

                // load GameRenderer dynamically
                const GameRendererModule = await import("../game/engine/GameRenderer");

                // second safeguard
                if (!isMounted) return;

                const RendererClass = GameRendererModule.default;

                // We just pass the App instance. The player creation happens on 'start()'.
                gameRendererRef.current = new RendererClass(app, mapData, playerName);

                console.log(`Connecting to server as: ${playerName}`);

                // --- Setup Socket Callbacks ---

                socketClient.onJoin = (response) => {
                    console.log("Joined! Spawning entity at:", response.spawnX, response.spawnY);

                    // Call start on renderer with server data (ID and Coordinates)
                    gameRendererRef.current.start(response);
                }

                // When server sends a snapshot, we update visuals
                socketClient.onGameState = (gameState) => {
                    if (gameRendererRef.current) {
                        gameRendererRef.current.syncState(gameState);
                    }
                };

                // Connect to WebSocket
                socketClient.connect(playerName, true); // true = isGuest

            } catch (error) {
                console.error("Failed to initialize game:", error);
            }
        };

        initGame();

        // Cleanup
        return () => {
            isMounted = false;

            socketClient.disconnect();

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
    }, [navigate, location.state]);

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