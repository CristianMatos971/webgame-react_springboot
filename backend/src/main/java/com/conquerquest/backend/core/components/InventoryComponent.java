package com.conquerquest.backend.core.components;

import java.util.HashMap;
import java.util.Map;

import com.conquerquest.backend.core.ecs.GameComponent;

public class InventoryComponent implements GameComponent {

    private final int capacity;
    // Slot Index -> ItemId (int)
    private final Map<Integer, Integer> slots;
    // Slot Index -> Quantity
    private final Map<Integer, Integer> quantities;

    public InventoryComponent(int capacity) {
        this.capacity = capacity;
        this.slots = new HashMap<>(capacity);
        this.quantities = new HashMap<>(capacity);
    }

    // Logic to add/remove items...
    public boolean addItem(int itemId, int quantity) {
        // TODO: implement item addition logic with capacity checks
        return true;
    }
}