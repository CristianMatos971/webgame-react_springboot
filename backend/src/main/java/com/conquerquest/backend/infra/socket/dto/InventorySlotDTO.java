package com.conquerquest.backend.infra.socket.dto;

public record InventorySlotDTO(
        int id,
        String name,
        int count,
        String icon // string ID mapped in frontend to an image
) {
}