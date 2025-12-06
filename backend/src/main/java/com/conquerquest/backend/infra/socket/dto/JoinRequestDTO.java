package com.conquerquest.backend.infra.socket.dto;

public record JoinRequestDTO(
        String userId,
        String guestName,
        boolean isGuest) {
}