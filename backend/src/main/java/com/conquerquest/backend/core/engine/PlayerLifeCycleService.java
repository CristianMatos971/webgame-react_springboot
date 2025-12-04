package com.conquerquest.backend.core.engine;

import com.conquerquest.backend.core.components.*;
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

    private final UserRepository userRepository;
    private final WorldState worldState;

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

        return createEntityInternal(tempUserId, temporaryName + " (Guest)", true);
    }

    private UUID createEntityInternal(UUID userId, String username, boolean isGuest) {
        UUID entityId = worldState.createEntity();

        worldState.addComponent(entityId, new PlayerTagComponent(userId, username, isGuest));
        // worldState.addComponent(entityId, new StatsComponent(100, 5f, 1.5f, 50f,
        // 0.5f));
        worldState.addComponent(entityId, new CollisionComponent(32f, 32f));

        // TODO: Get from WorldMapService
        worldState.addComponent(entityId, new PositionComponent(100f, 100f, 0f));
        worldState.addComponent(entityId, new InputComponent(0f, 0f, Set.of(), 0f, 0f));
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