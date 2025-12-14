package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.systems.ItemType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class InventorySlot {
    private ItemType item;
    private int quantity;

    // Auxiliar para somar itens (Stacking)
    public void addQuantity(int amount) {
        this.quantity += amount;
    }

    public void removeQuantity(int amount) {
        this.quantity -= amount;
    }
}
