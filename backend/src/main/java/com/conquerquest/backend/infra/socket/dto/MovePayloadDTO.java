package com.conquerquest.backend.infra.socket.dto;

public record MovePayloadDTO(
        float x,
        float y,
        float facingX,
        float facingY,
        boolean isSprinting,
        boolean isDashing) {
}