package com.conquerquest.backend.core.systems;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.conquerquest.backend.core.components.DashComponent;
import com.conquerquest.backend.core.components.InputComponent;
import com.conquerquest.backend.core.components.InputType;
import com.conquerquest.backend.core.components.MovementStatsComponent;
import com.conquerquest.backend.core.components.VelocityComponent;
import com.conquerquest.backend.core.ecs.GameSystem;
import com.conquerquest.backend.core.state.WorldState;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlayerControlSystem implements GameSystem {

    private static final float DIAGONAL_FACTOR = 0.7071f;

    @Override
    public void update(WorldState state, float delta) {
        var entities = state.getEntitiesWith(
                InputComponent.class,
                MovementStatsComponent.class,
                DashComponent.class);

        for (UUID id : entities) {
            InputComponent input = state.getComponent(id, InputComponent.class);
            MovementStatsComponent stats = state.getComponent(id, MovementStatsComponent.class);
            DashComponent dashState = state.getComponent(id, DashComponent.class);
            // TODO: Use SurvivalComponent for stamina, etc.

            updateDashTimers(dashState, stats, delta);
            handleDashInput(dashState, input, stats);

            VelocityComponent velocity = calculateVelocity(input, stats, dashState);
            // writes velocity component for MovementSystem to process
            state.addComponent(id, velocity);
        }
    }

    private void updateDashTimers(DashComponent dash, MovementStatsComponent stats, float delta) {
        // Cooldown management
        if (dash.getCooldownTimer() > 0) {
            dash.setCooldownTimer(dash.getCooldownTimer() - delta);
        }

        // Duration management
        if (dash.isDashing()) {
            dash.setDurationTimer(dash.getDurationTimer() - delta);

            if (dash.getDurationTimer() <= 0) {
                dash.setDashing(false);
                dash.setCooldownTimer(stats.dashCooldown());
            }
        }
    }

    private void handleDashInput(DashComponent dash, InputComponent input, MovementStatsComponent stats) {
        // We use tryConsumeAction to ensure the dash only fires once per key press
        boolean dashRequested = input.tryConsumeAction(InputType.DASH);

        if (dashRequested && !dash.isDashing() && dash.getCooldownTimer() <= 0) {
            startDash(dash, input, stats);
        }
    }

    private void startDash(DashComponent dash, InputComponent input, MovementStatsComponent stats) {
        dash.setDashing(true);
        dash.setDurationTimer(stats.dashDuration());

        float dirX = input.getX();
        float dirY = input.getY();

        // If not moving, dash towards facing direction
        if (dirX == 0 && dirY == 0) {
            dash.setDashDirX(input.getFacingX());
            dash.setDashDirY(input.getFacingY());
        } else {
            // Apply diagonal normalization if moving diagonally
            if (dirX != 0 && dirY != 0) {
                dirX *= DIAGONAL_FACTOR;
                dirY *= DIAGONAL_FACTOR;
            }
            dash.setDashDirX(dirX);
            dash.setDashDirY(dirY);
        }
    }

    private VelocityComponent calculateVelocity(InputComponent input, MovementStatsComponent stats,
            DashComponent dash) {
        // Dash Movement Priority
        if (dash.isDashing()) {
            return new VelocityComponent(
                    dash.getDashDirX() * stats.dashSpeed(),
                    dash.getDashDirY() * stats.dashSpeed());
        }

        // Standard Movement
        if (input.getX() == 0 && input.getY() == 0) {
            return new VelocityComponent(0, 0);
        }

        float currentSpeed = stats.baseSpeed();
        if (input.isSprinting()) {
            currentSpeed *= stats.sprintMultiplier();
        }

        float vx = input.getX();
        float vy = input.getY();

        // Diagonal normalization
        if (vx != 0 && vy != 0) {
            vx *= DIAGONAL_FACTOR;
            vy *= DIAGONAL_FACTOR;
        }

        return new VelocityComponent(vx * currentSpeed, vy * currentSpeed);
    }
}