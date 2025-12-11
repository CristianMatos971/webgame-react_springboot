package com.conquerquest.backend.core.services;

import com.conquerquest.backend.core.components.InputComponent;
import com.conquerquest.backend.core.components.PlayerTagComponent;
import com.conquerquest.backend.core.components.PositionComponent;
import com.conquerquest.backend.core.components.SurvivalComponent;
import com.conquerquest.backend.core.components.VitalityComponent;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.infra.socket.dto.EntitySnapshotDTO;
import com.conquerquest.backend.infra.socket.dto.GameStateDTO;
import com.conquerquest.backend.infra.socket.dto.PlayerStatsDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnapshotService {

    private final WorldState worldState;
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<UUID, PlayerStatsDTO> lastSentStats = new ConcurrentHashMap<>();

    // High Frequency Channel - 60Hz
    // Visual data - position and movement
    public void broadcastState() {
        List<UUID> entities = worldState.getEntitiesWith(PositionComponent.class);
        List<EntitySnapshotDTO> snapshots = new ArrayList<>(entities.size());

        for (UUID id : entities) {
            PositionComponent pos = worldState.getComponent(id, PositionComponent.class);

            if (pos != null) {
                snapshots.add(new EntitySnapshotDTO(id, pos.getX(), pos.getY()));
            }
        }

        GameStateDTO gameState = new GameStateDTO(System.currentTimeMillis(), snapshots);

        messagingTemplate.convertAndSend("/topic/gamestate", gameState);
    }

    /**
     * Low Frequency Channel - OnChange
     * Sends individually to each player
     */
    public void broadcastPlayerStats() {
        for (UUID entityId : worldState.getEntitiesWith(SurvivalComponent.class, VitalityComponent.class)) {
            PlayerTagComponent playerTag = worldState.getComponent(entityId, PlayerTagComponent.class);

            if (playerTag != null) {
                processStatsForPlayer(entityId, playerTag.userId());
            }
        }
    }

    private void processStatsForPlayer(UUID entityId, UUID userId) {
        var vital = worldState.getComponent(entityId, VitalityComponent.class);
        var surv = worldState.getComponent(entityId, SurvivalComponent.class);

        if (vital == null || surv == null)
            return;

        PlayerStatsDTO currentStats = new PlayerStatsDTO(
                (int) vital.getHealth(),
                (int) vital.getStamina(),
                (int) surv.getHunger(),
                (int) surv.getThirst(),
                (int) surv.getTemperature());

        PlayerStatsDTO lastStats = lastSentStats.get(userId);

        if (lastStats == null || !lastStats.equals(currentStats)) {
            lastSentStats.put(userId, currentStats);

            messagingTemplate.convertAndSend("/topic/stats/" + userId, currentStats);
        }
    }

    public void clearCache(UUID userId) {
        lastSentStats.remove(userId);
    }

}