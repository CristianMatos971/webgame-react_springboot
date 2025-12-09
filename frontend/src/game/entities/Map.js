import * as PIXI from 'pixi.js';

export const TILE_TYPES = {
    GRASS: 0,
    WATER: 1,
    TREE: 2,
    ROCK: 3
};

export class Map {
    constructor(app, backgroundLayer, entityLayer, mapData) {
        this.app = app;
        this.backgroundLayer = backgroundLayer;
        this.entityLayer = entityLayer;
        this.tileSize = 64;

        this.mapData = mapData;

        this.widthInTiles = mapData.length;
        this.heightInTiles = mapData[0].length;
        this.worldWidth = this.widthInTiles * this.tileSize;
        this.worldHeight = this.heightInTiles * this.tileSize;

        this.create();
    }

    create() {
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

                const groundType = (type === TILE_TYPES.WATER) ? TILE_TYPES.WATER : TILE_TYPES.GRASS;
                const groundTile = new PIXI.Sprite(textures[groundType]);
                groundTile.x = posX;
                groundTile.y = posY;
                this.backgroundLayer.addChild(groundTile);

                if (type === TILE_TYPES.TREE || type === TILE_TYPES.ROCK) {
                    const objectSprite = new PIXI.Sprite(textures[type]);
                    objectSprite.x = posX;
                    objectSprite.y = posY;
                    this.entityLayer.addChild(objectSprite);
                }
            }
        }
        console.log("Map rendered from server data.");
    }


    //utility functions

    checkCollision(x, y, width = 32, height = 32) {
        const padding = 5.0;

        const left = x + padding;
        const right = x + width - padding;
        const top = y + padding;
        const bottom = y + height - padding;

        if (this.isPointSolid(left, top)) return true;
        if (this.isPointSolid(right, top)) return true;
        if (this.isPointSolid(left, bottom)) return true;
        if (this.isPointSolid(right, bottom)) return true;

        return false;
    }

    isPointSolid(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        // out of bounds is solid
        if (tileX < 0 || tileX >= this.widthInTiles || tileY < 0 || tileY >= this.heightInTiles) {
            return true;
        }

        const type = this.mapData[tileX][tileY];

        return type === TILE_TYPES.TREE || type === TILE_TYPES.ROCK;
    }

    getTerrainMultiplier(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        //safety check
        if (tileX < 0 || tileX >= this.widthInTiles || tileY < 0 || tileY >= this.heightInTiles) {
            return 1.0;
        }

        const tileType = this.mapData[tileX][tileY];

        if (tileType === 1) return 0.5;
        return 1.0;
    }

    // Helper methods to create simple textures
    createGrassTexture(size) {
        const g = new PIXI.Graphics();
        g.rect(0, 0, size, size).fill(0x4CAF50).stroke({ width: 1, color: 0x1B5E20, alpha: 0.1 });
        return this.app.renderer.generateTexture(g);
    }
    createWaterTexture(size) {
        const g = new PIXI.Graphics();
        g.rect(0, 0, size, size).fill(0x29B6F6);
        return this.app.renderer.generateTexture(g);
    }
    createRockTexture(size) {
        const g = new PIXI.Graphics();
        g.circle(size / 2, size / 2, size / 2 - 5).fill(0x9E9E9E);
        return this.app.renderer.generateTexture(g);
    }
    createTreeTexture(size) {
        const g = new PIXI.Graphics();
        g.circle(size / 2, size / 2, size / 2 - 5).fill(0x2E7D32);
        return this.app.renderer.generateTexture(g);
    }
}