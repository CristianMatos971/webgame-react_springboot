export class CameraSystem {
    constructor(worldContainer, app, mapDimensions) {
        this.world = worldContainer;
        this.app = app;
        this.map = mapDimensions;
        this.target = null;

        // Smoothing factor (0.0 = no movement, 1.0 = instant snap, 0.1 = smooth)
        this.lerpFactor = 0.1;

        this.zoom = 1.5;

        this.world.scale.set(this.zoom);
    }

    setZoom(zoomLevel) {
        this.zoom = zoomLevel;
        this.world.scale.set(this.zoom);
        if (this.target) {
            this.update(0, true); // Snap to target on zoom change
        }
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
        let targetWorldX = (screenWidth / 2) - (this.target.x * this.zoom);
        let targetWorldY = (screenHeight / 2) - (this.target.y * this.zoom);

        const mapScreenWidth = this.map.width * this.zoom;
        const mapScreenHeight = this.map.height * this.zoom;

        // Clamp to Map Boundaries (Don't show black void outside map)
        if (mapScreenWidth > screenWidth) {
            const minX = screenWidth - mapScreenWidth;
            targetWorldX = Math.max(Math.min(targetWorldX, 0), minX);
        } else {
            targetWorldX = (screenWidth - mapScreenWidth) / 2;
        }

        if (mapScreenHeight > screenHeight) {
            const minY = screenHeight - mapScreenHeight;
            targetWorldY = Math.max(Math.min(targetWorldY, 0), minY);
        } else {
            targetWorldY = (screenHeight - mapScreenHeight) / 2;
        }

        // Apply Movement
        if (forceSnap) {
            this.world.x = targetWorldX;
            this.world.y = targetWorldY;
        } else {
            // Smooth Interpolation (Lerp)
            // Current = Current + (Target - Current) * Factor
            const currentX = this.world.position.x;
            const currentY = this.world.position.y;

            const nextX = currentX + (targetWorldX - currentX) * this.lerpFactor;
            const nextY = currentY + (targetWorldY - currentY) * this.lerpFactor;

            // final rounding to avoid sub-pixel rendering
            this.world.position.x = Math.round(nextX * this.zoom) / this.zoom;
            this.world.position.y = Math.round(nextY * this.zoom) / this.zoom;
        }
    }

    //Returns the rectangle of the world currently visible on screen.
    // Useful for View Culling (rendering optimization). 
    getVisibleBounds() {
        return {
            x: -this.world.x / this.zoom,
            y: -this.world.y / this.zoom,
            width: this.app.screen.width / this.zoom,
            height: this.app.screen.height / this.zoom
        };
    }
}