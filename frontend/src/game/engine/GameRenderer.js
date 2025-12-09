import * as PIXI from 'pixi.js';
import { Map as GameMap } from '../entities/Map';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { SceneManager } from '../scenes/SceneManager';
import { MovementSystem } from '../systems/MovementSystem';
import { NetworkSyncSystem } from '../systems/NetworkSyncSystem';

class GameRenderer {
    constructor(app, mapData, playerName) {
        if (!app) throw new Error("GameRenderer requires a PixiJS App instance.");

        // Set global PIXI options
        PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';
        PIXI.AbstractRenderer.defaultOptions.roundPixels = true;

        this.playerName = playerName;
        this.app = app;
        this.mapData = mapData;

        // 1. Setup Scene Hierarchy
        this.scene = new SceneManager(this.app);

        // 2. Initialize Core Systems
        this.inputSystem = new InputSystem();
        this.movementSystem = new MovementSystem();

        // 3. Initialize Map
        this.map = new GameMap(this.app, this.scene.backgroundLayer, this.scene.entityLayer, mapData);

        // Placeholders for late-init objects
        this.player = null;
        this.networkSystem = null;
        this.camera = null;
        this.serverGhost = null;

        console.log("GameRenderer initialized.");
    }

    start(joinData) {
        this.myEntityId = joinData.entityId;

        // Create Main Player
        this.player = new Player(
            this.app,
            this.scene.entityLayer,
            joinData.spawnX,
            joinData.spawnY,
            this.playerName
        );

        // Debug: Server Ghost (Visual validation for Authoritative Server)
        this.serverGhost = new PIXI.Graphics();
        this.serverGhost.beginFill(0xFF0000, 0.5);
        this.serverGhost.drawRect(0, 0, 32, 32);
        this.serverGhost.endFill();
        this.serverGhost.x = joinData.spawnX;
        this.serverGhost.y = joinData.spawnY;
        this.scene.entityLayer.addChild(this.serverGhost);

        // Initialize Network System 
        this.networkSystem = new NetworkSyncSystem(
            this.app,
            this.scene.entityLayer,
            this.myEntityId
        );

        // Setup Camera
        this.camera = new CameraSystem(
            this.scene.world,
            this.app,
            { width: this.map.worldWidth, height: this.map.worldHeight }
        );
        this.camera.follow(this.player.sprite);

        // Start Loop
        this.app.ticker.add(this.update, this); // Bind 'this' context

        console.log(`Game Started! My Entity ID: ${this.myEntityId}`);
    }

    /**
     * Delegate State Sync to NetworkSystem
     */
    syncState(gameState) {
        if (this.networkSystem) {
            this.networkSystem.processSnapshot(gameState, this.player, null/* this.serverGhost*/);
        }
    }

    /**
     * Main Game Loop
     * Orchestrates systems in correct order
     */
    update(ticker) {
        const delta = ticker.deltaTime;

        // Process Input & Local Physics
        if (this.player) {
            this.movementSystem.update(delta, this.player, this.inputSystem, this.map);
        }

        // Update Camera
        if (this.camera) {
            this.camera.update(delta);
        }
    }

    destroy() {
        this.app.ticker.remove(this.update, this);

        if (this.inputSystem) this.inputSystem.destroy();
        if (this.networkSystem) this.networkSystem.destroy();
        if (this.scene) this.scene.destroy();
        if (this.player) this.player.destroy();

        this.map = null;
        this.camera = null;
    }
}

export default GameRenderer;