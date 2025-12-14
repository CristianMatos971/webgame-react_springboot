package com.conquerquest.backend.infra.socket.dto;

public record InventorySlotDTO(
                int slotIndex,
                String itemId, // Item name (ex: "WOOD")
                int quantity) {
}