package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;
import java.util.HashSet;
import java.util.Set;

public class InputComponent implements GameComponent {
    // Constantly changing data
    private float x;
    private float y;
    private float facingX;
    private float facingY;
    private boolean isSprinting;

    // Triggers that need to be consumed
    private final Set<InputType> triggers = new HashSet<>();

    private float aimX;
    private float aimY;

    public InputComponent(float x, float y, float facingX, float facingY, boolean isSprinting,
            Set<InputType> initialActions, float aimX, float aimY) {
        this.x = x;
        this.y = y;
        this.facingX = facingX;
        this.facingY = facingY;
        this.isSprinting = isSprinting;
        if (initialActions != null) {
            this.triggers.addAll(initialActions);
        }
        this.aimX = aimX;
        this.aimY = aimY;
    }

    public float getX() {
        return x;
    }

    public float getY() {
        return y;
    }

    public float getFacingX() {
        return facingX;
    }

    public float getFacingY() {
        return facingY;
    }

    public boolean isSprinting() {
        return isSprinting;
    }

    // --- Consuming events logic

    public boolean tryConsumeAction(InputType type) {
        return triggers.remove(type);
    }

    public boolean hasPendingAction(InputType type) {
        return triggers.contains(type);
    }

    public void updateMovementState(float x, float y, float facingX, float facingY, boolean isSprinting) {
        this.x = x;
        this.y = y;
        this.facingX = facingX;
        this.facingY = facingY;
        this.isSprinting = isSprinting;
    }

    public void addTrigger(InputType type) {
        this.triggers.add(type);
    }
}