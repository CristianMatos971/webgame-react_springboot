package com.conquerquest.backend.core.components;

import java.util.UUID;

import com.conquerquest.backend.core.ecs.GameComponent;

public record PlayerTagComponent(
        UUID userId,
        String username,
        boolean isGuest) implements GameComponent {
}