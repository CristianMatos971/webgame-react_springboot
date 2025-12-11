package com.conquerquest.backend.infra.socket.dto;

import java.util.Map;

public class PacketDTO {
    public String userId;
    public String type; // "MOVE", "ATTACK", "USE_ITEM"

    public Map<String, Object> payload;
}