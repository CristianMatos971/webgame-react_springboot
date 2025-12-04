package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

public record VelocityComponent(float dx, float dy) implements GameComponent {
}