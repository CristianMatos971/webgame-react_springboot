import * as PIXI from 'pixi.js';
import { TILE_TYPES } from './MapConstants';

export class MapRenderer {
    /**
     * @param {Object} layers - Container references { backgroundLayer, entityLayer }.
     * @param {number} tileSize - Size of tiles.
     * @param {Object} assets - Loaded assets object from MapAssets.js.
     */
    constructor(layers, tileSize, assets) {
        this.bgLayer = layers.backgroundLayer;
        this.entityLayer = layers.entityLayer;
        this.tileSize = tileSize;
        this.assets = assets;
    }

    /**
     * Main render loop for the map.
     * @param {MapPhysics} physics - Reference to physics for neighbor checking.
     */
    render(physics) {
        const { widthInTiles, heightInTiles } = physics;

        // Controle local para evitar sobreposição de decorações
        // Armazena strings "x,y"
        const decoratedTiles = new Set();

        for (let x = 0; x < widthInTiles; x++) {
            for (let y = 0; y < heightInTiles; y++) {
                const type = physics.getTileType(x, y);
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                const isWater = type === TILE_TYPES.WATER;
                const isOccupied = type === TILE_TYPES.TREE || type === TILE_TYPES.ROCK;

                // --- Layer 1: Ground/Water ---
                if (isWater) {
                    this.renderWaterTile(x, y, posX, posY, physics);
                } else {
                    this.renderGrassTile(posX, posY);

                    // Tentativa de decorar (passamos o Set e Physics para validar)
                    if (!isOccupied) {
                        this.handleDecorations(x, y, physics, decoratedTiles);
                    }
                }

                // --- Layer 2: Objects (Trees/Rocks) ---
                if (isOccupied) {
                    this.renderObject(type, posX, posY);
                }
            }
        }
    }

    renderObject(type, posX, posY) {
        // Exemplo: Se for ROCK, usa textura de pedra, se TREE usa árvore
        const tex = type === TILE_TYPES.TREE ? this.assets.otherTextures[TILE_TYPES.TREE] : this.assets.ores.rockMid;

        if (tex) {
            const objectSprite = new PIXI.Sprite(tex);
            objectSprite.x = posX;
            objectSprite.y = posY;
            this.entityLayer.addChild(objectSprite);
        }
    }

    renderGrassTile(posX, posY) {
        const noise = Math.random();
        const variants = this.assets.grassVariants;

        const grassTex = noise < 0.6 ? variants[0] :
            noise < 0.85 ? variants[1] : variants[2];

        const groundTile = new PIXI.Sprite(grassTex);
        groundTile.x = posX;
        groundTile.y = posY;
        groundTile.width = this.tileSize;
        groundTile.height = this.tileSize;

        this.applySubtleGrassTint(groundTile);
        this.bgLayer.addChild(groundTile);
    }

    renderWaterTile(x, y, posX, posY, physics) {
        const base = new PIXI.Sprite(this.assets.waterTiles.base);
        base.x = posX;
        base.y = posY;
        base.width = this.tileSize;
        base.height = this.tileSize;
        this.bgLayer.addChild(base);

        const n = physics.getTileType(x, y - 1);
        const s = physics.getTileType(x, y + 1);
        const w = physics.getTileType(x - 1, y);
        const e = physics.getTileType(x + 1, y);

        const { corner, edge } = this.assets.waterTiles;

        if (n !== TILE_TYPES.WATER && w !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, corner.NW);
        else if (n !== TILE_TYPES.WATER && e !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, corner.NE);
        else if (s !== TILE_TYPES.WATER && w !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, corner.SW);
        else if (s !== TILE_TYPES.WATER && e !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, corner.SE);
        else {
            if (n !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, edge.N);
            if (s !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, edge.S);
            if (w !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, edge.W);
            if (e !== TILE_TYPES.WATER) this.drawOverlay(posX, posY, edge.E);
        }
    }

    drawOverlay(x, y, texture) {
        const sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.width = this.tileSize;
        sprite.height = this.tileSize;
        this.bgLayer.addChild(sprite);
    }

    /**
     * Agora aceita Grid Coordinates (x, y) em vez de pixel.
     */
    handleDecorations(x, y, physics, decoratedTiles) {
        // Se este tile já foi decorado por um cluster vizinho, aborta
        if (decoratedTiles.has(`${x},${y}`)) return;

        const roll = Math.random();
        const { flowers, debris } = this.assets.decals;

        // Probabilidades ajustadas
        if (roll < 0.05) {
            if (this.tryRegisterTile(x, y, physics, decoratedTiles)) {
                const tex = flowers[Math.floor(Math.random() * flowers.length)];
                this.spawnDecalAtPixel(tex, x * this.tileSize, y * this.tileSize);
            }
        } else if (roll < 0.10) {
            if (this.tryRegisterTile(x, y, physics, decoratedTiles)) {
                const tex = debris[Math.floor(Math.random() * debris.length)];
                this.spawnDecalAtPixel(tex, x * this.tileSize, y * this.tileSize);
            }
        }
    }

    /**
     * Tenta registrar o tile como decorado. Retorna true se sucesso.
     */
    tryRegisterTile(x, y, physics, decoratedTiles) {
        const key = `${x},${y}`;

        // 1. Já tem decoração?
        if (decoratedTiles.has(key)) return false;

        // 2. É grama? (Não pode ser água nem out-of-bounds)
        if (physics.getTileType(x, y) !== TILE_TYPES.GRASS) return false;

        // 3. É solido? (Tem árvore ou pedra?)
        // Convertemos Grid -> Pixel apenas para checar colisão central do tile
        const pixelX = x * this.tileSize;
        const pixelY = y * this.tileSize;
        if (physics.isPointSolid(pixelX + 32, pixelY + 32)) return false;

        // Sucesso: Marca e retorna true
        decoratedTiles.add(key);
        return true;
    }

    spawnTuftCluster(centerX, centerY, textures, physics, decoratedTiles) {
        const clusterSize = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < clusterSize; i++) {
            // Random offset (-1, 0, +1)
            const offsetX = Math.floor(Math.random() * 3) - 1;
            const offsetY = Math.floor(Math.random() * 3) - 1;

            const targetX = centerX + offsetX;
            const targetY = centerY + offsetY;

            // Valida este tile específico do cluster
            if (this.tryRegisterTile(targetX, targetY, physics, decoratedTiles)) {
                const tex = textures[Math.floor(Math.random() * textures.length)];
                // Spread true = espalha um pouco dentro do tile
                this.spawnDecalAtPixel(tex, targetX * this.tileSize, targetY * this.tileSize, true);
            }
        }
    }

    spawnDecalAtPixel(texture, tilePixelX, tilePixelY, spread = false) {
        const decal = new PIXI.Sprite(texture);
        decal.anchor.set(0.5);
        decal.scale.set(3); // Pixel art scaling

        const padding = spread ? 20 : 16;
        decal.x = tilePixelX + padding + Math.random() * (this.tileSize - padding * 2);
        decal.y = tilePixelY + padding + Math.random() * (this.tileSize - padding * 2);

        if (Math.random() > 0.5) decal.scale.x *= -1;
        this.bgLayer.addChild(decal);
    }

    applySubtleGrassTint(sprite) {
        const shade = 0.97 + Math.random() * 0.03;
        const v = Math.floor(255 * shade);
        sprite.tint = (v << 16) | (v << 8) | v;
    }
}