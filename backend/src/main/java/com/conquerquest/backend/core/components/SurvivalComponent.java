package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SurvivalComponent implements GameComponent {
    private int hunger; // 0-100
    private int thirst; // 0-100
    private float temperature; // Body temp
    private float coldResistance;
}
