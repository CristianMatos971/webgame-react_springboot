package com.conquerquest.backend.core.engine;

import com.conquerquest.backend.core.ecs.GameSystem;
import com.conquerquest.backend.core.services.SnapshotService;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.core.systems.PhysicsSystem;
import com.conquerquest.backend.core.systems.PlayerControlSystem;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GameLoop {

    private final WorldState worldState;

    private final PhysicsSystem physicsSystem;

    private final PlayerControlSystem playerControlSystem;

    private final SnapshotService snapshotService;

    // Target: 60 Ticks Per Second (1000ms / 60 ≈ 16.6ms)
    private static final int TICK_RATE_MS = 16;

    // Fixed delta time in seconds for physics consistency
    private static final float DELTA_TIME = 0.016f;

    private long lastTickTime = System.currentTimeMillis();

    @Scheduled(fixedRate = TICK_RATE_MS)
    public void tick() {
        try {
            // 1. Calculate real delta (optional, using fixed for stability now)
            // long now = System.currentTimeMillis();
            // float realDelta = (now - lastTickTime) / 1000f;
            // lastTickTime = now;

            // 2. Execute Logic Systems
            // The order matters! Movement -> Collision -> Combat -> StateCleanup
            playerControlSystem.update(worldState, DELTA_TIME);
            physicsSystem.update(worldState, DELTA_TIME);

            snapshotService.broadcastState();

        } catch (Exception e) {
            log.error("Error in Game Loop", e);
        }
    }
}