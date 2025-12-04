package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VitalityComponent implements GameComponent {
    private int health;
    private int maxHealth;
    private int mana;
    private int maxMana;

    // Helper
    public boolean isDead() {
        return health <= 0;
    }
}
