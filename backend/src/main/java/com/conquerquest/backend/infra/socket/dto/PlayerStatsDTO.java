package com.conquerquest.backend.infra.socket.dto;

public record PlayerStatsDTO(
        int health,
        int stamina,
        int hunger,
        int thirst,
        int temperature) {
}