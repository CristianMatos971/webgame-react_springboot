package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PositionComponent implements GameComponent {
    private float x;
    private float y;
    private float rotation;

    public void update(float x, float y) {
        this.x = x;
        this.y = y;
    }
}