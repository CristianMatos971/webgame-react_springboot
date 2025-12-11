package com.conquerquest.backend.core.engine;

import com.conquerquest.backend.core.components.*;
import com.conquerquest.backend.core.services.WorldMapService;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.domain.user.User;
import com.conquerquest.backend.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerLifeCycleService {

    private static final float PLAYER_BASE_SPEED = 180f; // px/sec
    private static final float PLAYER_SPRINT_MULT = 1.5f;
    private static final float PLAYER_HITBOX_SIZE = 32f;

    private final UserRepository userRepository;
    private final WorldState worldState;
    private final WorldMapService worldMapService;

    // Mapping: UserID (Persisted or Temp) -> EntityID (ECS)
    private final Map<UUID, UUID> activeSessions = new ConcurrentHashMap<>();

    public UUID spawnPlayer(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (activeSessions.containsKey(userId)) {
            removePlayer(activeSessions.get(userId));
        }

        return createEntityInternal(user.getId(), user.getUsername(), false);
    }

    public UUID spawnGuest(String temporaryName) {
        UUID tempUserId = UUID.randomUUID();
        String finalName = (temporaryName == null || temporaryName.isBlank())
                ? "Guest"
                : temporaryName + " (Guest)";

        return createEntityInternal(tempUserId, finalName, true);
    }

    private UUID createEntityInternal(UUID userId, String username, boolean isGuest) {
        UUID entityId = worldState.createEntity();

        worldState.addComponent(entityId, new PlayerTagComponent(userId, username, isGuest));
        // Speed in the backend works diferently from the frontend, there baseSpeed is
        // 3, here it must be 3*60(fps) = 180;
        worldState.addComponent(entityId, new MovementStatsComponent(
                180f, // Base Speed
                1.5f, // Sprint Mult
                20f, // Min Speed
                800f, // Dash Speed (Explosão)
                0.2f, // Dash Duration (0.2s)
                2.0f // Dash Cooldown (1.5s)
        ));
        worldState.addComponent(entityId, new DashComponent(false, 0f, 0f, 0f, 0f));
        worldState.addComponent(entityId, new CollisionComponent(PLAYER_HITBOX_SIZE, PLAYER_HITBOX_SIZE));

        var spawnPoint = worldMapService.getValidSpawnPoint();

        worldState.addComponent(entityId, new PositionComponent(spawnPoint.x(), spawnPoint.y(), 0f));
        worldState.addComponent(entityId, new InputComponent(0f, 0f, 0f, 1f, false, Set.of(), 0f, 0f));
        worldState.addComponent(entityId, new InventoryComponent(20));

        activeSessions.put(userId, entityId);
        log.info("Player spawned: {} [Guest: {}]", username, isGuest);

        return entityId;
    }

    public void removePlayer(UUID entityId) {
        PlayerTagComponent identity = worldState.getComponent(entityId, PlayerTagComponent.class);

        if (identity != null) {
            if (!identity.isGuest()) {
                // TODO: save player data to database
                log.info("Saving data for user: {}", identity.username());
            }

            activeSessions.remove(identity.userId());
            log.info("Player removed: {}", identity.username());
        }

        worldState.removeEntity(entityId);
    }

    public UUID getEntityIdByUserId(UUID userId) {
        return activeSessions.get(userId);
    }
}