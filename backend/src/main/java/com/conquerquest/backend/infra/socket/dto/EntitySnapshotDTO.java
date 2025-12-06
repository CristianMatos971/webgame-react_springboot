package com.conquerquest.backend.infra.socket.dto;

import java.util.UUID;

public record EntitySnapshotDTO(
        UUID id,
        float x,
        float y
// TODO: Add more components as needed (health, status effects, etc
) {
}