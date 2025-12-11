package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashComponent implements GameComponent {
    private boolean isDashing;
    private float durationTimer;
    private float cooldownTimer;

    // fixed direction during dash
    private float dashDirX;
    private float dashDirY;
}