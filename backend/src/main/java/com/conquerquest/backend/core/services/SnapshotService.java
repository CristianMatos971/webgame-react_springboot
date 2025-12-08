package com.conquerquest.backend.core.services;

import com.conquerquest.backend.core.components.PositionComponent;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.infra.socket.dto.EntitySnapshotDTO;
import com.conquerquest.backend.infra.socket.dto.GameStateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SnapshotService {

    private final WorldState worldState;
    private final SimpMessagingTemplate messagingTemplate;

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
}