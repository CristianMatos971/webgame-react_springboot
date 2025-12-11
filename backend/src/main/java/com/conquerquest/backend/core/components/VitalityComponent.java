package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VitalityComponent implements GameComponent {
    private float health;
    private float maxHealth;
    private float stamina;
    private float maxStamina;
}
