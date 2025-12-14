package com.conquerquest.backend.infra.socket.dto;

import java.util.List;

public record InventoryStateDTO(
        List<InventorySlotDTO> slots, // Only occupied slots
        int capacity // Total capacity - for drawing empty slots
) {
}
