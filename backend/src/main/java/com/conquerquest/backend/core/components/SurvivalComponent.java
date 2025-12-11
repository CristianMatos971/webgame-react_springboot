package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SurvivalComponent implements GameComponent {
    private float hunger;
    private float maxHunger;

    private float thirst;
    private float maxThirst;

    private float temperature;
    private float MaxTemperature;
    private float coldResistance;
}
