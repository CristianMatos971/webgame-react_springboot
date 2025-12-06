package com.conquerquest.backend.core.services;

import com.conquerquest.backend.core.components.PositionComponent;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.infra.socket.dto.EntitySnapshotDTO;
import com.conquerquest.backend.infra.socket.dto.GameStateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SnapshotService {

    private final WorldState worldState;
    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastState() {
        List<UUID> entities = worldState.getEntitiesWith(PositionComponent.class);

        List<EntitySnapshotDTO> snapshots = entities.stream()
                .map(id -> {
                    PositionComponent pos = worldState.getComponent(id, PositionComponent.class);
                    return new EntitySnapshotDTO(id, pos.x(), pos.y());
                })
                .collect(Collectors.toList());

        GameStateDTO gameState = new GameStateDTO(System.currentTimeMillis(), snapshots);

        messagingTemplate.convertAndSend("/topic/gamestate", gameState);
    }
}