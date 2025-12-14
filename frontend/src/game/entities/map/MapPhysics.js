import { TILE_TYPES } from './MapConstants';

export class MapPhysics {
    /**
     * @param {Array<Array<number>>} mapData - The raw grid data.
     * @param {number} tileSize - Size of a tile in pixels (e.g., 64).
     */
    constructor(mapData, tileSize) {
        this.mapData = mapData;
        this.tileSize = tileSize;
        this.widthInTiles = mapData ? mapData.length : 0;
        this.heightInTiles = mapData && mapData[0] ? mapData[0].length : 0;
    }

    /**
     * Safely retrieves the tile type at specific grid coordinates.
     * Returns -1 if out of bounds.
     */
    getTileType(x, y) {
        if (x < 0 || x >= this.widthInTiles || y < 0 || y >= this.heightInTiles) {
            return -1;
        }
        return this.mapData[x][y];
    }

    /**
     * Checks if a rectangular area collides with any solid tiles.
     * Used for player/enemy movement validation.
     * @param {number} x - World X position.
     * @param {number} y - World Y position.
     * @param {number} width - Entity width.
     * @param {number} height - Entity height.
     * @returns {boolean} True if collision detected.
     */
    checkCollision(x, y, width = 32, height = 32) {
        if (Number.isNaN(x) || Number.isNaN(y)) return true;

        const padding = 5.0; // Small buffer to prevent getting stuck on edges

        const left = x + padding;
        const right = x + width - padding;
        const top = y + padding;
        const bottom = y + height - padding;

        // Check all four corners of the bounding box
        if (this.isPointSolid(left, top)) return true;
        if (this.isPointSolid(right, top)) return true;
        if (this.isPointSolid(left, bottom)) return true;
        if (this.isPointSolid(right, bottom)) return true;

        return false;
    }

    /**
     * Determines if a specific pixel coordinate is inside a solid tile.
     */
    isPointSolid(x, y) {
        if (Number.isNaN(x) || Number.isNaN(y)) return true;

        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (tileX < 0 || tileX >= this.widthInTiles || tileY < 0 || tileY >= this.heightInTiles) {
            return true; // World bounds are solid
        }

        const type = this.mapData[tileX][tileY];
        if (type === undefined) return true;

        // Define what is solid (hardcoded for now, could be a property in MapConstants)
        return type === TILE_TYPES.TREE || type === TILE_TYPES.ROCK;
    }

    /**
     * Calculates movement speed multiplier based on terrain (e.g., walking on water).
     */
    getTerrainMultiplier(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        // Treat out of bounds as normal speed (or stop, handled by collision)
        if (tileX < 0 || tileX >= this.widthInTiles || tileY < 0 || tileY >= this.heightInTiles) {
            return 1.0;
        }

        const tileType = this.mapData[tileX][tileY];
        if (tileType === TILE_TYPES.WATER) return 0.5; // Slow down in water

        return 1.0;
    }
}