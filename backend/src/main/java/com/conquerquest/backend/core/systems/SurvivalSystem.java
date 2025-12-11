package com.conquerquest.backend.core.systems;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.conquerquest.backend.core.components.SurvivalComponent;
import com.conquerquest.backend.core.components.VitalityComponent;
import com.conquerquest.backend.core.ecs.GameSystem;
import com.conquerquest.backend.core.state.WorldState;

import lombok.RequiredArgsConstructor;

/**
 * System responsible for handling survival mechanics:
 * - Hunger decay over time
 * - Thirst decay over time
 * - Cold accumulation based on resistance
 * - Applying damage when stats reach critical levels
 */
@Service
@RequiredArgsConstructor
public class SurvivalSystem implements GameSystem {

    // --- Configuration Constants ---
    private static final float HUNGER_DECAY_PER_SEC = 0.5f; // Loses 0.5 hunger/sec
    private static final float THIRST_DECAY_PER_SEC = 0.8f; // Thirst drops faster than hunger
    private static final float BASE_ENV_COOLING_RATE = 5.0f;
    private static final float STARVATION_DAMAGE = 1.0f; // Damage per second when empty
    private static final float DEHYDRATION_DAMAGE = 1.5f;
    private static final float FREEZING_DAMAGE = 2.0f;

    @Override
    public void update(WorldState state, float delta) {
        // Fetch entities that have both Survival (stats) and Vitality (health to take
        // damage)
        var entities = state.getEntitiesWith(
                SurvivalComponent.class,
                VitalityComponent.class);

        for (UUID id : entities) {
            SurvivalComponent survival = state.getComponent(id, SurvivalComponent.class);
            VitalityComponent vitality = state.getComponent(id, VitalityComponent.class);

            // Process individual survival aspects
            updateHunger(survival, vitality, delta);
            updateThirst(survival, vitality, delta);
            updateTemperature(survival, vitality, delta);

        }
    }

    private void updateHunger(SurvivalComponent survival, VitalityComponent vitality, float delta) {
        float currentHunger = survival.getHunger();

        if (currentHunger > 0) {
            // Decrease hunger
            float newHunger = Math.max(0, currentHunger - (HUNGER_DECAY_PER_SEC * delta));
            survival.setHunger(newHunger);
        } else {
            // Apply starvation damage if hunger is 0
            applyDamage(vitality, STARVATION_DAMAGE * delta);
        }
    }

    private void updateThirst(SurvivalComponent survival, VitalityComponent vitality, float delta) {
        float currentThirst = survival.getThirst();

        if (currentThirst > 0) {
            // Decrease thirst
            float newThirst = Math.max(0, currentThirst - (THIRST_DECAY_PER_SEC * delta));
            survival.setThirst(newThirst);
        } else {
            // Apply dehydration damage if thirst is 0
            applyDamage(vitality, DEHYDRATION_DAMAGE * delta);
        }
    }

    private void updateTemperature(SurvivalComponent survival, VitalityComponent vitality, float delta) {
        float currentTemp = survival.getTemperature();
        float maxTemp = survival.getMaxTemperature();
        float resistance = survival.getColdResistance();

        float heatLossRate = BASE_ENV_COOLING_RATE - resistance;

        float newTemp = currentTemp - (heatLossRate * delta);

        // Clamp values between 0 (Freezing Point) and MaxTemperature (Comfort Zone)
        newTemp = Math.max(0, Math.min(newTemp, maxTemp));

        survival.setTemperature(newTemp);

        // Apply Hypothermia Damage if Temperature hits 0
        if (newTemp <= 0) {
            applyDamage(vitality, FREEZING_DAMAGE * delta);
        }
    }

    /**
     * Helper to apply damage to VitalityComponent safely.
     */
    private void applyDamage(VitalityComponent vitality, float amount) {
        if (vitality.getHealth() > 0) {
            float newHealth = Math.max(0, vitality.getHealth() - amount);
            vitality.setHealth(newHealth);
        }
    }
}
