package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;
import java.util.Set;

public record InputComponent(
        float x,
        float y,

        // active actions (sprint, attack, dash, etc)
        Set<InputType> actions,

        float aimX,
        float aimY) implements GameComponent {

    public boolean isMoving() {
        return x != 0 || y != 0;
    }

    public boolean isSprinting() {
        return actions.contains(InputType.SPRINT);
    }

    public boolean isAttacking() {
        return actions.contains(InputType.ATTACK);
    }

    public boolean isDashing() {
        return actions.contains(InputType.DASH);
    }
}

enum InputType {
    SPRINT,
    ATTACK,
    DASH,
    INTERACT,
    USE_ITEM
}