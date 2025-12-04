package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

public record CollisionComponent(float width, float height) implements GameComponent {
}