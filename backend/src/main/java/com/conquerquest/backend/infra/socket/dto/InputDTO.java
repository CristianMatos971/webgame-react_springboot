package com.conquerquest.backend.infra.socket.dto;

import java.util.Set;

public record InputDTO(
                String userId, // For now, we trust the client to send the correct userId
                float x,
                float y,
                boolean isSprinting,
                Set<String> actions // "ATTACK", "DASH", etc
) {
}