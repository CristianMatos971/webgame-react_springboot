import * as PIXI from 'pixi.js';
import { Map } from '../entities/Map';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';
import { CameraSystem } from '../systems/CameraSystem';

class GameRenderer {
    constructor(app, playerName) {
        if (!app) throw new Error("GameRenderer requires a PixiJS App instance.");
        this.app = app;
        this.playerName = playerName;

        this.setupScene();

        // Start input system
        this.inputSystem = new InputSystem();

        // setup entities and managers
        this.map = new Map(this.app, this.backgroundLayer, this.entityLayer);

        const centerX = this.app.screen.width / 2;
        const centerY = this.app.screen.height / 2;
        const spawnPoint = this.map.getValidSpawnPoint();
        this.player = new Player(this.app, this.entityLayer, spawnPoint.x, spawnPoint.y, this.map);

        // setup camera system
        this.camera = new CameraSystem(
            this.world,
            this.app,
            { width: this.map.worldWidth, height: this.map.worldHeight }
        );

        // tell camera to follow the player
        this.camera.follow(this.player.sprite);

        // starts the update loop
        this.app.ticker.add((ticker) => this.update(ticker));
        console.log("GameRenderer initialized engine.");
    }

    setupScene() {
        this.world = new PIXI.Container();

        this.backgroundLayer = new PIXI.Container();
        this.entityLayer = new PIXI.Container();

        this.uiLayer = new PIXI.Container();

        this.world.addChild(this.backgroundLayer);
        this.world.addChild(this.entityLayer);

        this.app.stage.addChild(this.world);
        this.app.stage.addChild(this.uiLayer);
    }

    update(ticker) {
        const delta = ticker.deltaTime;

        // Update player movement based on input
        if (this.player && this.inputSystem) {
            const direction = this.inputSystem.getDirection();
            this.player.setMovementInput(direction.x, direction.y, direction.isSprinting);
            this.player.update(delta);
        }

        if (this.camera) {
            this.camera.update(delta);
        }
    }

    destroy() {
        if (this.inputSystem) {
            this.inputSystem.destroy();
        }
        this.camera = null;
        this.player = null;
        this.map = null;
        // ... additional cleanup if needed
    }
}

export default GameRenderer;