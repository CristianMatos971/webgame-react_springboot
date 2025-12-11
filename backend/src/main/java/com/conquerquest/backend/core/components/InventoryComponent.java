package com.conquerquest.backend.core.components;

import java.util.Arrays;

import lombok.Data;

/**
 * Component responsible for holding player inventory data.
 * Size is fixed to 10 slots because of frontend requirements.
 */
@Data
public class InventoryComponent {
    // Represents item IDs. 0 or -1 can represent "Empty".
    private final int[] slots = new int[10];
    private final int[] quantities = new int[10];

    public InventoryComponent() {
        // Initialize empty inventory
        Arrays.fill(slots, 0);
        Arrays.fill(quantities, 0);
    }

    public int[] getSlots() {
        return slots;
    }

    public int[] getQuantities() {
        return quantities;
    }

    public void setItem(int index, int itemId, int quantity) {
        if (index >= 0 && index < slots.length) {
            this.slots[index] = itemId;
            this.quantities[index] = quantity;
        }
    }
}