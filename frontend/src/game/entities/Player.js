import * as PIXI from 'pixi.js';

export class Player {
    constructor(app, container, x, y, playerName) {
        this.playerName = playerName;
        this.app = app;
        this.parentContainer = container;

        // Visual dimensions
        this.width = 40;
        this.height = 40;

        this.sprite = new PIXI.Container();
        this.sprite.x = x;
        this.sprite.y = y;

        // Creating the visual representation
        this.characterVisual = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.characterVisual.tint = 0xe62731;
        this.characterVisual.width = this.width;
        this.characterVisual.height = this.height;
        this.characterVisual.anchor.set(0.5); // center pivot

        this.sprite.addChild(this.characterVisual);

        this.createNameTag();

        this.parentContainer.addChild(this.sprite);
    }

    createNameTag() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });

        const nameTag = new PIXI.Text({ text: this.playerName, style: style });

        nameTag.anchor.set(0.5, 1);
        nameTag.y = -(this.height / 2) - 10;

        this.sprite.addChild(nameTag);

        this.nameTag = nameTag;
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
            this.characterVisual.scale.x = Math.sign(x) * Math.abs(this.characterVisual.scale.x);
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
        this.parentContainer.removeChild(this.sprite);
        this.sprite.destroy({ children: true });
    }
}