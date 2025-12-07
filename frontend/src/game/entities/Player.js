import * as PIXI from 'pixi.js';

export class Player {
    constructor(app, container, x, y) {
        this.app = app;
        this.container = container;

        // Visual dimensions
        this.width = 40;
        this.height = 40;

        this.sprite = this.createPlayerSprite();

        // Initial position (Snap to server coordinates immediately)
        this.sprite.x = x;
        this.sprite.y = y;
    }

    createPlayerSprite() {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        sprite.tint = 0xe62731; // Red - dev placeholder
        sprite.width = this.width;
        sprite.height = this.height;
        sprite.anchor.set(0.5); // Pivot to center

        this.container.addChild(sprite);
        return sprite;
    }

    /**
     * Visual update loop.
     * Logic is handled by the server (Backend).
     * This method should handle animations, particles, or strictly visual interpolation.
     */
    update(delta) {
        // Future: Add breathing animation or running particles here.
    }

    /**
     * Updates visual state based on local input.
     * Does NOT change X/Y (that's the server's job), but changes 
     * sprite direction (flip) to give immediate feedback.
     */
    setMovementInput(x, y, isSprinting) {
        // Flip sprite horizontally based on direction
        if (x !== 0) {
            this.sprite.scale.x = Math.sign(x) * Math.abs(this.sprite.scale.x);
        }
    }

    /**
     * Called by GameRenderer when a Server Snapshot arrives.
     * Snaps the player to the authoritative position.
     */
    syncPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
    }

    destroy() {
        this.container.removeChild(this.sprite);
        this.sprite.destroy();
    }
}