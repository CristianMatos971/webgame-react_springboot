import { socketClient } from '../network/SocketClient';

const PREDICTED_SPEED = 3.0;
const SPRINT_MULTIPLIER = 1.5;
const DIAGONAL_CORRECTION = 0.7071;
const HITBOX_SIZE = 32;
const HALF_SIZE = HITBOX_SIZE / 2;

export class MovementSystem {
    constructor() {
        this.lastSentInput = { x: 0, y: 0, isSprinting: false };
    }

    /**
     * Processes input and moves the player locally (Client Prediction)
     * @param {number} delta - Ticker delta time
     * @param {Player} player - The main player entity
     * @param {InputSystem} inputSystem - The input handler
     * @param {GameMap} map - The map for collision checking
     */
    update(delta, player, inputSystem, map) {
        if (!player || !inputSystem) return;

        const dir = inputSystem.getDirection();

        //  Calculate Velocity
        if (dir.x !== 0 || dir.y !== 0) {
            let moveSpeed = PREDICTED_SPEED;
            if (dir.isSprinting) moveSpeed *= SPRINT_MULTIPLIER;

            // Terrain modifiers
            if (map) {
                const modifier = map.getTerrainMultiplier(player.sprite.x, player.sprite.y);
                moveSpeed *= modifier;
            }

            let vx = dir.x * moveSpeed * delta;
            let vy = dir.y * moveSpeed * delta;

            // Diagonal normalization
            if (dir.x !== 0 && dir.y !== 0) {
                vx *= DIAGONAL_CORRECTION;
                vy *= DIAGONAL_CORRECTION;
            }

            // Collision Detection & Application
            this.applyMovement(player, map, vx, vy);

            // Update Visuals (Animations/Flip)
            player.setMovementInput(dir.x, dir.y, dir.isSprinting);
        }

        // 4. Network: Send Input to Server
        this.broadcastInput(dir);
    }

    applyMovement(player, map, vx, vy) {
        const currentX = player.sprite.x;
        const currentY = player.sprite.y;

        let nextX = currentX + vx;


        if (map) {
            const hitX = map.checkCollision(
                nextX - HALF_SIZE,   // Top-Left X
                currentY - HALF_SIZE,// Top-Left Y 
                HITBOX_SIZE,
                HITBOX_SIZE
            );

            if (hitX) {
                nextX = currentX;
            }
        }
        player.sprite.x = nextX;

        let nextY = currentY + vy;

        if (map) {
            const hitY = map.checkCollision(
                nextX - HALF_SIZE,
                nextY - HALF_SIZE,
                HITBOX_SIZE,
                HITBOX_SIZE
            );

            if (hitY) {
                nextY = currentY;
            }
        }
        player.sprite.y = nextY;
    }

    broadcastInput(dir) {
        const hasInputChanged =
            dir.x !== this.lastSentInput.x ||
            dir.y !== this.lastSentInput.y ||
            dir.isSprinting !== this.lastSentInput.isSprinting;

        if (hasInputChanged) {
            socketClient.sendInput({
                x: dir.x,
                y: dir.y,
                isSprinting: dir.isSprinting,
                actions: []
            });
            this.lastSentInput = { ...dir };
        }
    }
}