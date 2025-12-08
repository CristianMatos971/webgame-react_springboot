import { Player } from '../entities/Player';

const SNAP_THRESHOLD = 150;     // Hard reset if too far
const RECONCILE_THRESHOLD = 50; // Smooth fix limit
const LERP_FACTOR = 0.1;        // Smoothing speed (0.1 = 10% per tick)

export class NetworkSyncSystem {
    constructor(app, entityLayer, myEntityId) {
        this.app = app;
        this.entityLayer = entityLayer;
        this.myEntityId = myEntityId;
        this.otherEntities = {}; // Map<ID, Player>
    }

    /**
     * Processes a Server Snapshot
     * @param {Object} gameState - The payload from server
     * @param {Player} mainPlayer - The local player instance
     * @param {PIXI.Graphics} ghost - (Debug) Server position visualizer
     */
    processSnapshot(gameState, mainPlayer, ghost) {
        if (!gameState || !gameState.entities) return;

        const activeIds = new Set();

        gameState.entities.forEach(snapshot => {
            activeIds.add(snapshot.id);

            //Reconcile Main Player
            if (snapshot.id === this.myEntityId) {
                if (mainPlayer) {
                    if (this.ghost)
                        this.handleReconciliation(mainPlayer, snapshot, ghost);
                    else
                        this.handleReconciliation(mainPlayer, snapshot, null);
                }
            }
            // Interpolate Other Players
            else {
                this.updateOtherPlayer(snapshot);
            }
        });

        this.cleanupDisconnected(activeIds);
    }

    handleReconciliation(player, snapshot, ghost) {
        // Debug Visual
        if (ghost) {
            ghost.x = snapshot.x;
            ghost.y = snapshot.y;
        }

        const dx = player.sprite.x - snapshot.x;
        const dy = player.sprite.y - snapshot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > SNAP_THRESHOLD) {
            // Hard Correction
            player.syncPosition(snapshot.x, snapshot.y);
        } else if (distance > RECONCILE_THRESHOLD) {
            // Soft Correction (Lerp)
            const newX = player.sprite.x + (snapshot.x - player.sprite.x) * LERP_FACTOR;
            const newY = player.sprite.y + (snapshot.y - player.sprite.y) * LERP_FACTOR;
            player.syncPosition(newX, newY);
        }
    }

    updateOtherPlayer(snapshot) {
        let other = this.otherEntities[snapshot.id];

        if (!other) {
            // Factory logic could be extracted, but keeping simple for now
            other = new Player(this.app, this.entityLayer, snapshot.x, snapshot.y);
            other.sprite.tint = 0x0000FF; // Distinguish enemy
            this.otherEntities[snapshot.id] = other;
        } else {
            // TODO: Add linear interpolation for smoother movement of others here
            other.syncPosition(snapshot.x, snapshot.y);
        }
    }

    cleanupDisconnected(activeIds) {
        Object.keys(this.otherEntities).forEach(id => {
            // Convert key to number if necessary, depending on ID type
            const numId = Number(id);
            if (!activeIds.has(numId) && numId !== this.myEntityId) {
                this.otherEntities[id].destroy();
                delete this.otherEntities[id];
            }
        });
    }

    destroy() {
        Object.values(this.otherEntities).forEach(e => e.destroy());
        this.otherEntities = {};
    }
}