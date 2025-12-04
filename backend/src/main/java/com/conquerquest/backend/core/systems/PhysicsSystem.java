package com.conquerquest.backend.core.systems;

import com.conquerquest.backend.core.components.*;
import com.conquerquest.backend.core.ecs.GameSystem;
import com.conquerquest.backend.core.services.WorldMapService;
import com.conquerquest.backend.core.state.WorldState;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhysicsSystem implements GameSystem {

    private final WorldMapService worldMap;

    @Override
    public void update(WorldState state, float delta) {
        var entities = state.getEntitiesWith(
                PositionComponent.class,
                VelocityComponent.class,
                CollisionComponent.class);

        for (UUID id : entities) {
            VelocityComponent velocity = state.getComponent(id, VelocityComponent.class);

            if (velocity.dx() == 0 && velocity.dy() == 0)
                continue;

            PositionComponent pos = state.getComponent(id, PositionComponent.class);
            CollisionComponent hitbox = state.getComponent(id, CollisionComponent.class);

            float terrainMult = worldMap.getTerrainSpeedMultiplier(pos.x(), pos.y());

            float moveX = velocity.dx() * terrainMult * delta;
            float moveY = velocity.dy() * terrainMult * delta;

            // --- Collision Detection & Resolution ---
            float nextX = pos.x();
            float nextY = pos.y();

            if (!worldMap.checkCollision(pos.x() + moveX - (hitbox.width() / 2), pos.y() - (hitbox.height() / 2),
                    hitbox.width(), hitbox.height())) {
                nextX += moveX;
            }
            if (!worldMap.checkCollision(nextX - (hitbox.width() / 2), pos.y() + moveY - (hitbox.height() / 2),
                    hitbox.width(), hitbox.height())) {
                nextY += moveY;
            }

            if (nextX != pos.x() || nextY != pos.y()) {
                state.addComponent(id, new PositionComponent(nextX, nextY, pos.rotation()));
            }
        }
    }
}