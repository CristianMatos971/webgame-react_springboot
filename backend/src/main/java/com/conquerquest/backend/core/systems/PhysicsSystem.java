package com.conquerquest.backend.core.systems;

import com.conquerquest.backend.core.components.*;
import com.conquerquest.backend.core.ecs.GameSystem;
import com.conquerquest.backend.core.services.WorldMapService;
import com.conquerquest.backend.core.state.WorldState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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
            PositionComponent pos = state.getComponent(id, PositionComponent.class);

            if (velocity.getX() == 0 && velocity.getY() == 0)
                continue;

            CollisionComponent hitbox = state.getComponent(id, CollisionComponent.class);

            float terrainMult = worldMap.getTerrainSpeedMultiplier(pos.getX(), pos.getY());

            float moveX = velocity.getX() * terrainMult * delta;
            float moveY = velocity.getY() * terrainMult * delta;

            float currentX = pos.getX();
            float currentY = pos.getY();
            // assuming centered anchor
            float halfW = hitbox.width() / 2f;
            float halfH = hitbox.height() / 2f;

            float nextX = currentX + moveX;
            if (worldMap.checkCollision(nextX - halfW, currentY - halfH, hitbox.width(), hitbox.height())) {
                moveX = 0;
                nextX = currentX;
            }

            float nextY = currentY + moveY;
            if (worldMap.checkCollision(nextX - halfW, nextY - halfH, hitbox.width(), hitbox.height())) {
                moveY = 0;
                nextY = currentY;
            }

            if (nextX != currentX || nextY != currentY) {
                pos.setX(nextX);
                pos.setY(nextY);

                // TODO: Deal with rotation
            }
        }
    }
}