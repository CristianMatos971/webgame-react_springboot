import * as PIXI from 'pixi.js';
import { Map as GameMap } from '../entities/Map';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { socketClient } from '../network/SocketClient';


const PREDICTED_SPEED = 3.0; // Adjusted for 60FPS delta factors

class GameRenderer {
    constructor(app, mapData) {
        if (!app) throw new Error("GameRenderer requires a PixiJS App instance.");
        this.app = app;

        // Store other players
        this.otherEntities = {};
        this.myEntityId = null;

        this.setupScene();

        this.inputSystem = new InputSystem();

        this.lastSentInput = { x: 0, y: 0, isSprinting: false };

        // Initialize the static map visual
        this.map = new GameMap(this.app, this.backgroundLayer, this.entityLayer, mapData);

        console.log("GameRenderer initialized.");
    }

    setupScene() {
        this.world = new PIXI.Container();
        this.backgroundLayer = new PIXI.Container();
        this.entityLayer = new PIXI.Container(); // Players and objects here
        this.uiLayer = new PIXI.Container();

        this.world.addChild(this.backgroundLayer);
        this.world.addChild(this.entityLayer);

        this.app.stage.addChild(this.world);
        this.app.stage.addChild(this.uiLayer);
    }

    start(joinData) {
        this.myEntityId = joinData.entityId;

        // Create Main Player
        this.player = new Player(
            this.app,
            this.entityLayer,
            joinData.spawnX,
            joinData.spawnY
        );

        this.serverGhost = new PIXI.Graphics();
        this.serverGhost.beginFill(0xFF0000, 0.5); // Vermelho, 50% transparente
        this.serverGhost.drawRect(0, 0, 32, 32); // Tamanho do seu player
        this.serverGhost.endFill();
        this.entityLayer.addChild(this.serverGhost);

        // Setup Camera
        this.camera = new CameraSystem(
            this.world,
            this.app,
            { width: this.map.worldWidth, height: this.map.worldHeight }
        );
        this.camera.follow(this.player.sprite);

        // Start Loop
        this.app.ticker.add((ticker) => this.update(ticker));

        console.log(`Game Started! My Entity ID: ${this.myEntityId}`);
    }

    /**
     * Handles Server Snapshots.
     * Implements Server Reconciliation for the main player
     * and Interpolation for other players.
     */
    syncState(gameState) {
        if (!gameState || !gameState.entities) return;

        // Set of IDs in this snapshot to detect disconnections
        const activeIds = new Set();

        gameState.entities.forEach(snapshot => {
            activeIds.add(snapshot.id);

            // Reconcile Main Player
            if (snapshot.id === this.myEntityId && this.player) {
                this.handleReconciliation(snapshot);
            }
            // Update/Create Other Players
            else {
                this.updateOtherPlayer(snapshot);
            }
        });

        // Cleanup disconnected players
        Object.keys(this.otherEntities).forEach(id => {
            if (!activeIds.has(id) && id !== this.myEntityId) {
                this.otherEntities[id].destroy();
                delete this.otherEntities[id];
            }
        });
    }

    handleReconciliation(serverSnapshot) {
        // Calculate distance between local prediction and server truth
        const dx = this.player.sprite.x - serverSnapshot.x;
        const dy = this.player.sprite.y - serverSnapshot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Thresholds
        const SNAP_THRESHOLD = 150; // If too far (lag spike/teleport), snap immediately
        const RECONCILE_THRESHOLD = 50; // If variance is > 10px, correct it smoothly

        if (distance > SNAP_THRESHOLD) {
            // Hard correction (Teleport)
            this.player.syncPosition(serverSnapshot.x, serverSnapshot.y);
        } else if (distance > RECONCILE_THRESHOLD) {
            // Soft correction (Lerp towards server position)
            // We pull the player 10% closer to the server position per sync
            const t = 0.1;
            const newX = this.player.sprite.x + (serverSnapshot.x - this.player.sprite.x) * t;
            const newY = this.player.sprite.y + (serverSnapshot.y - this.player.sprite.y) * t;
            this.player.syncPosition(newX, newY);
        }

        if (this.serverGhost) {
            this.serverGhost.x = serverSnapshot.x;
            this.serverGhost.y = serverSnapshot.y;
        }
        // If distance < RECONCILE_THRESHOLD, we ignore the server and trust our prediction
        // to prevent micro-stuttering.
    }

    updateOtherPlayer(snapshot) {
        let other = this.otherEntities[snapshot.id];

        if (!other) {
            // New player entered view
            other = new Player(this.app, this.entityLayer, snapshot.x, snapshot.y);
            // Set tint to blue to distinguish others
            other.sprite.tint = 0x0000FF;
            this.otherEntities[snapshot.id] = other;
        } else {
            // Update existing player
            other.syncPosition(snapshot.x, snapshot.y);
        }
    }

    update(ticker) {
        const delta = ticker.deltaTime;

        // Main Player Logic
        if (this.player && this.inputSystem) {
            const dir = this.inputSystem.getDirection();

            // Apply movement immediately locally
            if (dir.x !== 0 || dir.y !== 0) {
                // Normalize diagonal speed
                let moveSpeed = PREDICTED_SPEED;
                if (dir.isSprinting) moveSpeed *= 1.5;

                if (this.map) {
                    const terrainMultiplier = this.map.getTerrainMultiplier(this.player.sprite.x, this.player.sprite.y);
                    moveSpeed *= terrainMultiplier;
                }

                let vx = dir.x * moveSpeed * delta;
                let vy = dir.y * moveSpeed * delta;

                // Diagonal correction
                if (dir.x !== 0 && dir.y !== 0) {
                    vx *= 0.7071;
                    vy *= 0.7071;
                }

                // Move sprite
                const nextX = this.player.sprite.x + vx;
                if (!this.map.checkCollision(nextX, this.player.sprite.y)) {
                    this.player.sprite.x = nextX;
                } else {
                    //optional: handle X collision feedback
                    vx = 0;
                }
                const nextY = this.player.sprite.y + vy;
                if (!this.map.checkCollision(this.player.sprite.x, nextY)) {
                    this.player.sprite.y = nextY;
                } else {
                    //optional: handle Y collision feedback
                    vy = 0;
                }

                // Update visuals (flip sprite)
                this.player.setMovementInput(dir.x, dir.y, dir.isSprinting);
            }

            //Send Input to Server (Server Authoritative check)
            // We optimize network by only sending if input state changed or periodically
            const hasInputChanged =
                dir.x !== this.lastSentInput.x ||
                dir.y !== this.lastSentInput.y ||
                dir.isSprinting !== this.lastSentInput.isSprinting;

            if (hasInputChanged) {
                socketClient.sendInput({
                    x: dir.x,
                    y: dir.y,
                    isSprinting: dir.isSprinting,
                    actions: []
                });

                this.lastSentInput = { x: dir.x, y: dir.y, isSprinting: dir.isSprinting };
            }

            if (this.camera) {
                this.camera.update(delta);
            }
        }
    }

    destroy() {
        if (this.inputSystem) this.inputSystem.destroy();

        // Cleanup all entities
        if (this.player) this.player.destroy();
        Object.values(this.otherEntities).forEach(e => e.destroy());
        this.otherEntities = {};

        this.camera = null;
        this.map = null;
    }
}

export default GameRenderer;