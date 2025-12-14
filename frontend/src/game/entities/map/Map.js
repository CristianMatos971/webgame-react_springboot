import { loadMapAssets } from './MapAssets';
import { MapPhysics } from './MapPhysics';
import { MapRenderer } from './MapRenderer';

export class Map {
    constructor(app, backgroundLayer, entityLayer, mapData) {
        this.app = app;

        // Define world constants
        this.tileSize = 64;

        if (!mapData || mapData.length === 0) {
            console.error("[Map] MapData is empty or invalid!");
            return;
        }

        // 1. Initialize Logic/Physics
        this.physics = new MapPhysics(mapData, this.tileSize);

        // 2. Prepare Rendering references
        this.layers = { backgroundLayer, entityLayer };
        this.renderer = null; // Will be init after assets load

        // 3. Start Creation Process
        this.create();
    }

    async create() {
        console.log("[Map] Loading assets...");

        // Load assets via the specialized module
        const assets = await loadMapAssets();

        // Initialize Renderer with loaded assets
        this.renderer = new MapRenderer(this.layers, this.tileSize, assets);

        console.log("[Map] Building map visual state...");

        // Trigger the initial render pass, passing physics for neighbor lookups
        this.renderer.render(this.physics);

        console.log("[Map] Map ready.");
    }

    // --- Public API (Facade) ---
    // Other systems (Input, Player) interact with Map via these methods,
    // which delegate to the correct sub-module.

    checkCollision(x, y, w, h) {
        return this.physics.checkCollision(x, y, w, h);
    }

    getTerrainMultiplier(x, y) {
        return this.physics.getTerrainMultiplier(x, y);
    }

    get worldWidth() {
        return this.physics.widthInTiles * this.tileSize;
    }

    get worldHeight() {
        return this.physics.heightInTiles * this.tileSize;
    }
}