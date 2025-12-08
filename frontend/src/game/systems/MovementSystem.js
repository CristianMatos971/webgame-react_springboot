import { socketClient } from '../network/SocketClient';

const PREDICTED_SPEED = 3.0;
const SPRINT_MULTIPLIER = 1.5;
const DIAGONAL_CORRECTION = 0.7071;

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
        const nextX = player.sprite.x + vx;
        const nextY = player.sprite.y + vy;

        // X Axis Check
        if (!map || !map.checkCollision(nextX, player.sprite.y)) {
            player.sprite.x = nextX;
        }

        // Y Axis Check
        if (!map || !map.checkCollision(player.sprite.x, nextY)) {
            player.sprite.y = nextY;
        }
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