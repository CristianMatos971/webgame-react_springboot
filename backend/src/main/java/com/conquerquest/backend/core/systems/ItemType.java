package com.conquerquest.backend.core.systems;

public enum ItemType {
    WOOD,
    STONE,
    IRON_ORE,
    POTION_HP,
    SWORD_WOODEN;

    // Método auxiliar para converter string segura (do DTO) para Enum
    public static ItemType fromString(String value) {
        try {
            return ItemType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            return null; // Item inválido
        }
    }
}