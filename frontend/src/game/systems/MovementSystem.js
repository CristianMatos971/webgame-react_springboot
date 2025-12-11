import { act } from 'react';
import { socketClient } from '../network/SocketClient';
import { gameEvents } from '../events/GameEventManager';
const CONFIG = {
    SPEED: 180,
    SPRINT_MULT: 1.5,
    DASH_SPEED: 800,
    DIAGONAL: 0.7071,
    HITBOX: 32,
    DASH_COOLDOWN: 2.1,
    DASH_DURATION: 0.2
};

export class MovementSystem {
    constructor() {
        this.lastSentInput = { x: 0, y: 0, facingX: 0, facingY: 1, isSprinting: false, actions: [] };

        this.timers = {
            dashCooldown: 0,
            dashDuration: 0
        };
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
        this.player = player;

        this.updateTimers(delta);

        const input = this.gatherInput(inputSystem);

        const isDashingActive = this.handleDashLogic(input.dashRequested, player);

        const velocity = this.calculateVelocity(delta, input, isDashingActive, player, map);

        if (velocity.x !== 0 || velocity.y !== 0) {
            this.applyPhysics(player, map, velocity.x, velocity.y);
            this.updateVisuals(player, input);
        }

        this.broadcast(input, isDashingActive);
    }

    updateTimers(delta) {
        if (this.timers.dashCooldown > 0) this.timers.dashCooldown -= delta;
        if (this.timers.dashDuration > 0) this.timers.dashDuration -= delta;
    }

    updateVisuals(player, input) {
        player.setMovementInput(input.x, input.y, input.facingX, input.facingY, input.isSprinting);
    }

    gatherInput(inputSystem) {
        const dir = inputSystem.getMovementVector();
        const triggered = inputSystem.getTriggeredActions();

        return {
            x: dir.x,
            y: dir.y,
            facingX: dir.facingX,
            facingY: dir.facingY,
            isSprinting: inputSystem.isActionHeld("SPRINT"),
            dashRequested: triggered.includes('DASH')
        };
    }

    handleDashLogic(dashRequested, player) {
        if (this.timers.dashDuration > 0) {
            return true;
        }

        if (this.player && this.player.isDashingPrediction) {
            this.player.isDashingPrediction = false;
        }

        if (!dashRequested) {
            return false;
        }

        if (this.timers.dashCooldown > 0) {
            return false;
        }

        this.timers.dashCooldown = CONFIG.DASH_COOLDOWN;
        this.timers.dashDuration = CONFIG.DASH_DURATION;

        gameEvents.emit('PLAYER_DASH', CONFIG.DASH_COOLDOWN * 1000);

        if (this.player) {
            this.player.isDashingPrediction = true;
        }

        return true;
    }

    calculateVelocity(delta, input, isDashing, player, map) {
        if (input.x === 0 && input.y === 0 && !isDashing) {
            return { x: 0, y: 0 };
        }

        let speed = CONFIG.SPEED;

        if (isDashing) {
            speed = CONFIG.DASH_SPEED;
        } else if (input.isSprinting) {
            speed *= CONFIG.SPRINT_MULT;
        }

        if (map) {
            speed *= map.getTerrainMultiplier(player.sprite.x, player.sprite.y);
        }

        let vx = input.x * speed * delta;
        let vy = input.y * speed * delta;

        if (isDashing && input.x === 0 && input.y === 0) {
            vx = input.facingX * speed * delta;
            vy = input.facingY * speed * delta;
        }

        if (!isDashing && input.x !== 0 && input.y !== 0) {
            vx *= CONFIG.DIAGONAL;
            vy *= CONFIG.DIAGONAL;
        }

        return { x: vx, y: vy };
    }

    applyPhysics(player, map, vx, vy) {
        const halfSize = CONFIG.HITBOX / 2;

        let nextX = player.sprite.x + vx;
        if (map && map.checkCollision(nextX - halfSize, player.sprite.y - halfSize, CONFIG.HITBOX, CONFIG.HITBOX)) {
            nextX = player.sprite.x;
        }
        player.sprite.x = nextX;

        let nextY = player.sprite.y + vy;
        if (map && map.checkCollision(nextX - halfSize, nextY - halfSize, CONFIG.HITBOX, CONFIG.HITBOX)) {
            nextY = player.sprite.y;
        }
        player.sprite.y = nextY;
    }

    broadcast(input, isDashingActive) {
        const currentInput = {
            x: input.x,
            y: input.y,
            facingX: input.facingX,
            facingY: input.facingY,
            isSprinting: input.isSprinting,
            isDashing: isDashingActive
        };
        const hasChanged =
            currentInput.x !== this.lastSentInput.x ||
            currentInput.y !== this.lastSentInput.y ||
            currentInput.facingX !== this.lastSentInput.facingX ||
            currentInput.facingY !== this.lastSentInput.facingY ||
            currentInput.isSprinting !== this.lastSentInput.isSprinting ||
            currentInput.isDashing !== this.lastSentInput.isDashing;

        if (hasChanged) {
            socketClient.sendInput("MOVE", currentInput);
            this.lastSentInput = { ...currentInput };
        }
    }
}