package com.conquerquest.backend.infra.socket.dto;

public record ActionPayloadDTO(
        String actionId, // "PRIMARY_ATTACK", "DRINK_POTION"
        String targetId,
        long timestamp // lag/cooldown validation
) {
}