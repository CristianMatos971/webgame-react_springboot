package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

// Pure Data - Immutable preferred for thread safety in snapshots
public record PositionComponent(float x, float y, float rotation) implements GameComponent {
}