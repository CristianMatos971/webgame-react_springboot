package com.conquerquest.backend.infra.socket.dto;

import java.util.UUID;

public record JoinResponseDTO(
        UUID userId,
        UUID entityId,
        String username,
        float spawnX,
        float spawnY,
        boolean success,
        String message) {
}