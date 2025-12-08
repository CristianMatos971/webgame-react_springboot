package com.conquerquest.backend.core.engine;

import com.conquerquest.backend.core.services.SnapshotService;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.core.systems.PhysicsSystem;
import com.conquerquest.backend.core.systems.PlayerControlSystem;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
@RequiredArgsConstructor
@Slf4j
public class GameLoop {

    @Getter
    private final WorldState worldState;

    private final PhysicsSystem physicsSystem;

    private final PlayerControlSystem playerControlSystem;

    private final SnapshotService snapshotService;

    // inputs queue that come from websocket handlers, thread-safe.
    // GameLoop consumes this, no one writes to State directly.
    private final Queue<Runnable> inputQueue = new ConcurrentLinkedQueue<>();

    // Target: 60 Ticks Per Second (1000ms / 60 ≈ 16.6ms)
    private static final int TICK_RATE_MS = 16;

    // Fixed delta time in seconds for physics consistency
    private static final float FIXED_DELTA = 0.016f;

    @Scheduled(fixedRate = TICK_RATE_MS)
    public void tick() {
        try {
            // procces inputs before updating the world
            while (!inputQueue.isEmpty()) {
                inputQueue.poll().run();
            }

            playerControlSystem.update(worldState, FIXED_DELTA);
            physicsSystem.update(worldState, FIXED_DELTA);

            // Broadcast
            snapshotService.broadcastState();

        } catch (Exception e) {
            log.error("CRITICAL: Error in Game Loop", e);
        }
    }

    /**
     * public method for controller adding input tasks to be processed safely
     */
    public void addInputTask(Runnable task) {
        inputQueue.add(task);
    }
}