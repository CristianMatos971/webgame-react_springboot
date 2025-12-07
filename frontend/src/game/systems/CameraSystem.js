export class CameraSystem {
    constructor(worldContainer, app, mapDimensions) {
        this.world = worldContainer;
        this.app = app;
        this.map = mapDimensions;
        this.target = null;

        // Smoothing factor (0.0 = no movement, 1.0 = instant snap, 0.1 = smooth)
        this.lerpFactor = 0.1;
    }

    follow(target) {
        this.target = target;
        // Snap immediately on first follow to prevent swoop-in effect from (0,0)
        this.update(0, true);
    }


    update(delta, forceSnap = false) {
        if (!this.target) return;

        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        // Calculate Target World Position (Center target on screen)
        let targetWorldX = (screenWidth / 2) - this.target.x;
        let targetWorldY = (screenHeight / 2) - this.target.y;

        // Clamp to Map Boundaries (Don't show black void outside map)
        if (this.map.width > screenWidth) {
            const minX = screenWidth - this.map.width;
            targetWorldX = Math.max(Math.min(targetWorldX, 0), minX);
        } else {
            // Center map if screen is wider than map
            targetWorldX = (screenWidth - this.map.width) / 2;
        }

        if (this.map.height > screenHeight) {
            const minY = screenHeight - this.map.height;
            targetWorldY = Math.max(Math.min(targetWorldY, 0), minY);
        } else {
            // Center map if screen is taller than map
            targetWorldY = (screenHeight - this.map.height) / 2;
        }

        // Apply Movement
        if (forceSnap) {
            this.world.x = targetWorldX;
            this.world.y = targetWorldY;
        } else {
            // Smooth Interpolation (Lerp)
            // Current = Current + (Target - Current) * Factor
            this.world.x += (targetWorldX - this.world.x) * this.lerpFactor;
            this.world.y += (targetWorldY - this.world.y) * this.lerpFactor;
        }
    }

    //Returns the rectangle of the world currently visible on screen.
    // Useful for View Culling (rendering optimization). 
    getVisibleBounds() {
        return {
            x: -this.world.x,
            y: -this.world.y,
            width: this.app.screen.width,
            height: this.app.screen.height
        };
    }
}