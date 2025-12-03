
const KEY_MAP = {
    'w': 'up',
    'arrowup': 'up',

    's': 'down',
    'arrowdown': 'down',

    'a': 'left',
    'arrowleft': 'left',

    'd': 'right',
    'arrowright': 'right',

    'shift': 'sprint'
};

export class InputSystem {
    constructor() {
        // keys state map
        this.actions = {
            up: false,
            down: false,
            left: false,
            right: false,
            sprint: false
        };

        // Binds so they keep the correct 'this' context
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        this.addEventListeners();
    }

    addEventListeners() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    removeEventListeners() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(event) {
        const key = event.key.toLowerCase();
        const action = KEY_MAP[key];

        // if the key is one we care about, set it to true
        if (action) {
            this.actions[action] = true;
        }
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        const action = KEY_MAP[key];

        if (action) {
            this.actions[action] = false;
        }
    }

    // calculate current direction based on keys pressed
    getDirection() {
        let x = 0;
        let y = 0;

        // Left (-1) or Right (+1)
        if (this.actions.left) x -= 1;
        if (this.actions.right) x += 1;

        // Up (-1) or Down (+1)
        if (this.actions.up) y -= 1;
        if (this.actions.down) y += 1;

        return { x, y, isSprinting: this.actions.sprint };

    }



    // Important for cleanup
    destroy() {
        this.removeEventListeners();
    }
}