
export const ACTIONS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    SPRINT: 'SPRINT',
    DASH: 'DASH',
    ATTACK: 'ATTACK'
};

const DEFAULT_KEY_MAP = {
    'w': ACTIONS.UP,
    'arrowup': ACTIONS.UP,
    's': ACTIONS.DOWN,
    'arrowdown': ACTIONS.DOWN,
    'a': ACTIONS.LEFT,
    'arrowleft': ACTIONS.LEFT,
    'd': ACTIONS.RIGHT,
    'arrowright': ACTIONS.RIGHT,
    'shift': ACTIONS.SPRINT,
    ' ': ACTIONS.DASH,
    'j': ACTIONS.ATTACK
};

export class InputSystem {
    constructor() {
        // keys state map
        this.keyMap = DEFAULT_KEY_MAP;

        // keys states - pressed or not
        this.heldKeys = new Set();

        // action Queue for one-time actions
        this.pressedTriggers = new Set();

        this.lastFacing = { x: 0, y: 1 }; // Default facing down

        // Binds so they keep the correct 'this' context
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onBlur = this.onBlur.bind(this); // Clean inputs on alt+tab or window blur

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('blur', this.onBlur);
    }

    unbindEvents() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('blur', this.onBlur);
    }

    onKeyDown(event) {
        const key = event.key.toLowerCase();
        const action = this.keyMap[key];

        if (!action) return;

        if (this.heldKeys.has(key)) return;

        this.heldKeys.add(key);
        this.pressedTriggers.add(action);
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        this.heldKeys.delete(key);
    }

    onBlur() {
        this.heldKeys.clear();
        this.pressedTriggers.clear();
    }

    // Public METHODS
    getMovementVector() {
        let x = 0;
        let y = 0;

        if (this.isActionHeld(ACTIONS.LEFT)) x -= 1;
        if (this.isActionHeld(ACTIONS.RIGHT)) x += 1;
        if (this.isActionHeld(ACTIONS.UP)) y -= 1;
        if (this.isActionHeld(ACTIONS.DOWN)) y += 1;

        if (x !== 0 || y !== 0) {
            this.lastFacing = { x, y };
        }

        return { x, y, facing: this.lastFacing };
    }

    isActionHeld(action) {
        for (const [key, mapAction] of Object.entries(this.keyMap)) {
            if (mapAction === action && this.heldKeys.has(key)) {
                return true;
            }
        }
        return false;
    }

    wasActionJustPressed(action) {
        if (this.pressedTriggers.has(action)) {
            this.pressedTriggers.delete(action); // Consume the trigger
            return true;
        }
        return false;
    }

    getTriggeredActions() {
        const actions = Array.from(this.pressedTriggers);
        this.pressedTriggers.clear();
        return actions;
    }

    //call at the end of each frame to clear one-time actions
    flush() {
        this.pressedTriggers.clear();
    }

    // Important for cleanup
    destroy() {
        this.removeEventListeners();
    }
}