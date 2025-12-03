export class CameraSystem {
    constructor(worldContainer, app, mapDimensions) {
        this.world = worldContainer;
        this.app = app;
        this.map = mapDimensions;
        this.target = null;
    }

    follow(target) {
        this.target = target;
    }

    update(delta) {
        if (!this.target) return;

        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;

        const targetX = this.target.x;
        const targetY = this.target.y;

        let targetWorldX = screenCenterX - targetX;
        let targetWorldY = screenCenterY - targetY;

        if (this.map.width > screenWidth) {
            const minX = screenWidth - this.map.width;
            targetWorldX = Math.max(Math.min(targetWorldX, 0), minX);
        } else {
            targetWorldX = (screenWidth - this.map.width) / 2;
        }

        // Alura
        if (this.map.height > screenHeight) {
            const minY = screenHeight - this.map.height;
            targetWorldY = Math.max(Math.min(targetWorldY, 0), minY);
        } else {
            targetWorldY = (screenHeight - this.map.height) / 2;
        }

        this.world.x = Math.round(targetWorldX);
        this.world.y = Math.round(targetWorldY);
    }

}