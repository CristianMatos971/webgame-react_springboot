package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

public record MovementStatsComponent(
        float baseSpeed,
        float sprintMultiplier,
        float minSpeed,
        float dashSpeed,
        float dashDuration,
        float dashCooldown

) implements GameComponent {
}