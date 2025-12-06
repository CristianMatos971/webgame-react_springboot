package com.conquerquest.backend.infra.socket.dto;

import java.util.List;

public record GameStateDTO(
        long serverTime,
        List<EntitySnapshotDTO> entities) {
}
