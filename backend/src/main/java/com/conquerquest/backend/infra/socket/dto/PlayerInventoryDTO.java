package com.conquerquest.backend.infra.socket.dto;

import java.util.List;

public record PlayerInventoryDTO(
        List<InventorySlotDTO> slots) {
}