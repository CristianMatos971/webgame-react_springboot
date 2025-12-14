package com.conquerquest.backend.core.services;

import com.conquerquest.backend.core.components.InventoryComponent;
import com.conquerquest.backend.core.components.PlayerTagComponent;
import com.conquerquest.backend.core.state.WorldState;
import com.conquerquest.backend.core.systems.ItemType;
import com.conquerquest.backend.infra.socket.dto.InventoryStateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final WorldState worldState;
    private final SnapshotService snapshotService;

    public void addItem(UUID entityId, String itemId, int quantity) {
        InventoryComponent inventory = worldState.getComponent(entityId, InventoryComponent.class);
        if (inventory == null)
            return;

        ItemType validItemId = ItemType.fromString(itemId);

        if (validItemId == null) {
            // ItemId doesn't exist
            return;
        }

        boolean success = inventory.addItem(validItemId, quantity);

        if (success) {
            sendUpdate(entityId, inventory);
        }
    }

    public void moveItem(UUID entityId, int fromSlot, int toSlot) {
        InventoryComponent inventory = worldState.getComponent(entityId, InventoryComponent.class);
        if (inventory == null)
            return;

        boolean success = inventory.swapItems(fromSlot, toSlot);

        if (success)
            sendUpdate(entityId, inventory);
    }

    // Método auxiliar para disparar o WebSocket
    private void sendUpdate(UUID entityId, InventoryComponent inventory) {
        PlayerTagComponent playerTag = worldState.getComponent(entityId, PlayerTagComponent.class);
        if (playerTag != null)
            snapshotService.sendInventoryUpdate(playerTag.userId(), inventory);
    }
}