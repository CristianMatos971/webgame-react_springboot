import * as PIXI from 'pixi.js';

//Enum for different tile types
export const TILE_TYPES = {
    GRASS: 0,
    WATER: 1,
    TREE: 2,
    ROCK: 3
};

// Configuration for map structures
const MAP_CONFIG = {
    LAKES: [
        { width: 2, height: 2, count: 15 }, // Small water (4 tiles)
        { width: 4, height: 2, count: 10 },  // Mid water (8 tiles)
        { width: 4, height: 3, count: 5 }   // Big water (12 tiles)
    ],
    ROCKS: [
        { width: 1, height: 1, count: 40 }, // Small rock
        { width: 2, height: 2, count: 15 }   // Big rock (4 tiles)
    ],
    FORESTS: [
        { width: 1, height: 1, count: 70 }, // Single trees
        { width: 2, height: 2, count: 20 }  // Clumps of trees
    ]
};

export class Map {
    constructor(app, backgroundLayer, entityLayer) {
        this.app = app;
        this.backgroundLayer = backgroundLayer;
        this.entityLayer = entityLayer;
        this.tileSize = 64; // each tile is 64x64 pixels

        this.widthInTiles = 50;  // 50 * 64 = 3200px of width
        this.heightInTiles = 50; // 3200px of height

        // world dimensions 
        this.worldWidth = this.widthInTiles * this.tileSize;
        this.worldHeight = this.heightInTiles * this.tileSize;

        // Generating data - simulating map data coming from server
        this.mapData = this.generateMapData();

        this.create();
    }

    generateMapData() {
        // Initialize the map completely with GRASS (Canvas)
        const data = Array(this.widthInTiles).fill(null).map(() => Array(this.heightInTiles).fill(TILE_TYPES.GRASS));

        // Helper function to try placing a structure
        const tryPlaceStructure = (type, width, height) => {
            // Pick a random position
            // Ensure that it picks a coordinate that doesn't go off the edge
            const x = Math.floor(Math.random() * (this.widthInTiles - width));
            const y = Math.floor(Math.random() * (this.heightInTiles - height));

            // Check if the area is clear (only replace GRASS)
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    if (data[x + i][y + j] !== TILE_TYPES.GRASS) {
                        return false; // Overlap detected, fail placement
                    }
                }
            }

            // If clear, stamp the structure
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    data[x + i][y + j] = type;
                }
            }
            return true; // Success
        };

        // Loop through configurations and place the blocks

        // Place Lakes
        MAP_CONFIG.LAKES.forEach(conf => {
            let placed = 0;
            let attempts = 0;
            // Try to place 'count' amount, but give up if map is too full (max 1000 attempts)
            while (placed < conf.count && attempts < 1000) {
                if (tryPlaceStructure(TILE_TYPES.WATER, conf.width, conf.height)) {
                    placed++;
                }
                attempts++;
            }
        });

        // Place Rocks
        MAP_CONFIG.ROCKS.forEach(conf => {
            let placed = 0;
            let attempts = 0;
            while (placed < conf.count && attempts < 1000) {
                if (tryPlaceStructure(TILE_TYPES.ROCK, conf.width, conf.height)) {
                    placed++;
                }
                attempts++;
            }
        });

        // Place Forests
        MAP_CONFIG.FORESTS.forEach(conf => {
            let placed = 0;
            let attempts = 0;
            while (placed < conf.count && attempts < 1000) {
                if (tryPlaceStructure(TILE_TYPES.TREE, conf.width, conf.height)) {
                    placed++;
                }
                attempts++;
            }
        });

        return data;
    }

    create() {
        // Generation Textures
        const textures = {
            [TILE_TYPES.GRASS]: this.createGrassTexture(this.tileSize),
            [TILE_TYPES.WATER]: this.createWaterTexture(this.tileSize),
            [TILE_TYPES.TREE]: this.createTreeTexture(this.tileSize),
            [TILE_TYPES.ROCK]: this.createRockTexture(this.tileSize)
        };

        for (let x = 0; x < this.widthInTiles; x++) {
            for (let y = 0; y < this.heightInTiles; y++) {
                const type = this.mapData[x][y];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                // Rendering Logic:

                // if type is WATER, draw water tile
                // else draw GRASS tile
                // if type is TREE or ROCK, draw extra sprite on top
                const groundType = (type === TILE_TYPES.WATER) ? TILE_TYPES.WATER : TILE_TYPES.GRASS;

                const groundTile = new PIXI.Sprite(textures[groundType]);
                groundTile.x = posX;
                groundTile.y = posY;
                this.backgroundLayer.addChild(groundTile);

                // if TREE or ROCK, draw on entity layer
                if (type === TILE_TYPES.TREE || type === TILE_TYPES.ROCK) {
                    const objectSprite = new PIXI.Sprite(textures[type]);
                    objectSprite.x = posX;
                    objectSprite.y = posY;
                    this.entityLayer.addChild(objectSprite);
                }
            }
        }

        console.log("Map generated with static entities.");
    }

    getValidSpawnPoint() {
        let attempts = 0;
        const maxAttempts = 1000;

        while (attempts < maxAttempts) {
            const gridX = Math.floor(Math.random() * this.widthInTiles);
            const gridY = Math.floor(Math.random() * this.heightInTiles);

            const type = this.mapData[gridX][gridY];

            if (!this.isSolid(type)) {
                return {
                    x: gridX * this.tileSize + (this.tileSize / 2),
                    y: gridY * this.tileSize + (this.tileSize / 2)
                };
            }
            attempts++;
        }

        //fallback
        console.warn("Could not find safe spawn point!");
        return { x: 0, y: 0 };
    }

    // check colisions

    isSolid(type) {
        // Define which tiles act as walls
        return type === TILE_TYPES.TREE ||
            type === TILE_TYPES.ROCK;
    }

    checkCollision(x, y, width, height) {
        // Define the 4 corners of the player's hitbox relative to the world
        // We shrink the box slightly (padding) to make movement smoother through gaps
        const padding = 5;

        const left = x + padding;
        const right = x + width - padding;
        const top = y + padding;
        const bottom = y + height - padding;

        // Helper to check a single point
        const isPointSolid = (px, py) => {
            // Convert pixel coordinates to grid coordinates
            const col = Math.floor(px / this.tileSize);
            const row = Math.floor(py / this.tileSize);

            // Check boundaries (prevent walking out of the map)
            if (col < 0 || col >= this.widthInTiles || row < 0 || row >= this.heightInTiles) {
                return true; // Out of bounds is essentially a wall
            }

            // Check the tile type in our data model
            const tileType = this.mapData[col][row];
            return this.isSolid(tileType);
        };

        // If any corner hits a solid tile, we have a collision
        if (isPointSolid(left, top)) return true;
        if (isPointSolid(right, top)) return true;
        if (isPointSolid(left, bottom)) return true;
        if (isPointSolid(right, bottom)) return true;

        return false;
    }

    // Spped multipliers
    getTerrainSpeedMultiplier(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        if (col < 0 || col >= this.widthInTiles || row < 0 || row >= this.heightInTiles) {
            return 1.0;
        }

        const type = this.mapData[col][row];

        if (type === TILE_TYPES.WATER) {
            return 0.5;
        }

        return 1.0; // Chão normal
    }

    // Texture generators (placeholders for now)

    createGrassTexture(size) {
        const g = new PIXI.Graphics();
        g.rect(0, 0, size, size).fill(0x4CAF50).stroke({ width: 1, color: 0x1B5E20, alpha: 0.1 }); // Reduced border opacity for smoother look
        return this.app.renderer.generateTexture(g);
    }

    createWaterTexture(size) {
        const g = new PIXI.Graphics();
        // Remove stroke or make it very subtle so tiles blend into a big lake
        g.rect(0, 0, size, size).fill(0x29B6F6);
        return this.app.renderer.generateTexture(g);
    }

    // ... createRockTexture e createTreeTexture iguais ...
    createRockTexture(size) {
        const g = new PIXI.Graphics();
        g.circle(size / 2, size / 2, size / 2 - 5).fill(0x9E9E9E);
        g.circle(size / 2 - 10, size / 2 - 10, 5).fill(0xBDBDBD);
        return this.app.renderer.generateTexture(g);
    }

    createTreeTexture(size) {
        const g = new PIXI.Graphics();
        g.ellipse(size / 2, size - 10, 15, 5).fill({ color: 0x000000, alpha: 0.3 });
        g.circle(size / 2, size / 2, size / 2 - 5).fill(0x2E7D32);
        g.circle(size / 2, size / 2 - 15, size / 3).fill(0x43A047);
        return this.app.renderer.generateTexture(g);
    }

}