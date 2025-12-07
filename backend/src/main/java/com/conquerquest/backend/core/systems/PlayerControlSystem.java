package com.conquerquest.backend.core.systems;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.conquerquest.backend.core.components.InputComponent;
import com.conquerquest.backend.core.components.MovementStatsComponent;
import com.conquerquest.backend.core.components.SurvivalComponent;
import com.conquerquest.backend.core.components.VelocityComponent;
import com.conquerquest.backend.core.ecs.GameSystem;
import com.conquerquest.backend.core.state.WorldState;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlayerControlSystem implements GameSystem {

    @Override
    public void update(WorldState state, float delta) {
        var entities = state.getEntitiesWith(
                InputComponent.class,
                MovementStatsComponent.class);

        for (UUID id : entities) {
            InputComponent input = state.getComponent(id, InputComponent.class);
            MovementStatsComponent stats = state.getComponent(id, MovementStatsComponent.class);
            // TODO: Use SurvivalComponent for stamina, etc.

            if (!input.isMoving()) {
                state.addComponent(id, new VelocityComponent(0, 0));
                continue;
            }

            float speed = stats.baseSpeed();

            if (input.isSprinting()) { // && survival.stamina > 0
                speed *= stats.sprintMultiplier();
                // TODO: survival.decreaseStamina(delta);
            }

            // Vetor Normalization - Diagonal Correction
            float dirX = input.x();
            float dirY = input.y();
            if (dirX != 0 && dirY != 0) {
                dirX *= 0.7071f;
                dirY *= 0.7071f;
            }

            // writes velocity component for MovementSystem to process
            state.addComponent(id, new VelocityComponent(dirX * speed, dirY * speed));
        }
    }
}