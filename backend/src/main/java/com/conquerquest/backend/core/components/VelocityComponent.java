package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VelocityComponent implements GameComponent {

    private float x;
    private float y;

    public void update(float vx, float vy) {
        this.x = vx;
        this.y = vy;
    }
}