package com.conquerquest.backend.core.components;

import com.conquerquest.backend.core.ecs.GameComponent;
import com.conquerquest.backend.core.systems.ItemType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryComponent implements GameComponent {

    private final InventorySlot[] slots;
    private final int capacity;

    public InventoryComponent(int capacity) {
        this.capacity = capacity;
        this.slots = new InventorySlot[capacity];
    }

    public boolean addItem(ItemType item, int quantity) {
        // Stack items
        for (int i = 0; i < capacity; i++) {
            InventorySlot slot = slots[i];
            if (slot != null && slot.getItem() == item) {

                // TODO: check maxStackSize
                slot.addQuantity(quantity);
                return true;
            }
        }

        // Add item to empty slots
        for (int i = 0; i < capacity; i++) {
            if (slots[i] == null) {
                slots[i] = new InventorySlot(item, quantity);
                return true;
            }
        }

        return false; // inventory's full
    }

    public boolean swapItems(int firstIndex, int secondIndex) {
        if (firstIndex < 0 || secondIndex < 0 || firstIndex >= capacity || secondIndex >= capacity
                || firstIndex == secondIndex)
            return false;

        InventorySlot tempSlot = this.slots[firstIndex];
        this.slots[firstIndex] = this.slots[secondIndex];
        this.slots[secondIndex] = tempSlot;

        return true;
    }

    public InventorySlot getSlot(int index) {
        if (index < 0 || index >= capacity)
            return null;
        return slots[index];
    }

    // Player dies -> clear inventory
    public void clear() {
        for (int i = 0; i < capacity; i++) {
            slots[i] = null;
        }
    }
}