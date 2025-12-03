import * as PIXI from 'pixi.js';

export class Player {
    constructor(app, container, x, y, map) {
        this.app = app;
        this.container = container;
        this.map = map; // Store reference to map for collision checks

        // Player local state
        this.inputVector = { x: 0, y: 0 };

        this.stats = {
            baseSpeed: 5,
            sprintMultiplier: 1.5,
            minSpeed: 1.0
        };

        this.isSprinting = false;

        // Player dimensions for collision (hitbox)
        this.width = 40;
        this.height = 40;

        this.sprite = this.createPlayerSprite();

        // initial position
        this.sprite.x = x;
        this.sprite.y = y;
    }

    createPlayerSprite() {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        sprite.tint = 0xe62731; // red - for dev right now
        sprite.width = this.width;
        sprite.height = this.height;
        sprite.anchor.set(0.5); // pivot to center

        this.container.addChild(sprite);

        return sprite;
    }

    update(delta) {
        if (this.inputVector.x === 0 && this.inputVector.y === 0) return;

        // --- Dynamic Speed Calculation ---

        let currentSpeed = this.stats.baseSpeed;

        if (this.isSprinting) {
            currentSpeed *= this.stats.sprintMultiplier;
        }

        const terrainMultiplier = this.map.getTerrainSpeedMultiplier(this.sprite.x, this.sprite.y);
        currentSpeed *= terrainMultiplier;

        if (currentSpeed < this.stats.minSpeed) currentSpeed = this.stats.minSpeed;

        // --- VECTOR NORMALIZATION (Diagonal correction) ---


        let dirX = this.inputVector.x;
        let dirY = this.inputVector.y;

        // if is moving diagonally
        if (dirX !== 0 && dirY !== 0) {
            //Multiply by diagonal factor (approx 1/sqrt(2))
            const DIAGONAL_FACTOR = 0.7071;
            dirX *= DIAGONAL_FACTOR;
            dirY *= DIAGONAL_FACTOR;
        }

        // now apply movement
        const moveX = dirX * currentSpeed * delta;
        const moveY = dirY * currentSpeed * delta;

        // --- Colision logic ---

        // Axe X
        const nextX = this.sprite.x + moveX;
        if (!this.map.checkCollision(
            nextX - this.width / 2,
            this.sprite.y - this.height / 2,
            this.width, this.height
        )) {
            this.sprite.x = nextX;
        }

        // Axe Y
        const nextY = this.sprite.y + moveY;
        if (!this.map.checkCollision(
            this.sprite.x - this.width / 2,
            nextY - this.height / 2,
            this.width, this.height
        )) {
            this.sprite.y = nextY;
        }
    }

    setMovementInput(x, y, isSprinting) {
        this.inputVector.x = x;
        this.inputVector.y = y;
        this.isSprinting = isSprinting;
    }
}