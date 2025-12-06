package com.conquerquest.backend.infra.socket.dto;

import java.util.UUID;

public record JoinResponseDTO(
        UUID entityId,
        float spawnX,
        float spawnY,
        boolean success,
        String message) {
}