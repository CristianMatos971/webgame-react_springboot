import * as PIXI from 'pixi.js';

export class SceneManager {
    constructor(app) {
        this.app = app;
        this.world = new PIXI.Container();
        this.backgroundLayer = new PIXI.Container();
        this.entityLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();

        this.setupHierarchy();
    }

    setupHierarchy() {
        // Z-Index ordering via sorting or insertion order
        this.world.addChild(this.backgroundLayer);
        this.world.addChild(this.entityLayer);

        // UI is separate from world to stick to screen
        this.app.stage.addChild(this.world);
        this.app.stage.addChild(this.uiLayer);
    }

    /**
     * Cleans up containers
     */
    destroy() {
        this.world.destroy({ children: true });
        this.uiLayer.destroy({ children: true });
    }
}