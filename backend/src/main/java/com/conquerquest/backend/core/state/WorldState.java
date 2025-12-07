package com.conquerquest.backend.core.state;

import com.conquerquest.backend.core.ecs.GameComponent;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Represents the state of the game world, including all entities and their
 * components.
 * Threadsafe for concurrent access. written by gameLopp and read by websocket
 * handlers.
 */
@Component
public class WorldState {

    // Entity ID -> Map<ComponentClass, ComponentInstance>
    // Ex: Entity 1 -> { PositionComponent.class: {x:10, y:10},
    // HealthComponent.class: {val:100} }
    private final Map<UUID, Map<Class<? extends GameComponent>, GameComponent>> components = new ConcurrentHashMap<>();

    /**
     * create a new entity and return its UUID.
     */
    public UUID createEntity() {
        UUID id = UUID.randomUUID();
        components.put(id, new ConcurrentHashMap<>());
        return id;
    }

    /**
     * remove an entity and all its components.
     */
    public void removeEntity(UUID entityId) {
        components.remove(entityId);
    }

    /**
     * adds a component to an entity or updates it if it already exists.
     */
    public void addComponent(UUID entityId, GameComponent component) {
        if (components.containsKey(entityId)) {
            components.get(entityId).put(component.getClass(), component);
        }
    }

    /**
     * gets a component of a specific type for an entity.
     */
    @SuppressWarnings("unchecked")
    public <T extends GameComponent> T getComponent(UUID entityId, Class<T> componentClass) {
        Map<Class<? extends GameComponent>, GameComponent> entityComponents = components.get(entityId);
        if (entityComponents == null)
            return null;
        return (T) entityComponents.get(componentClass);
    }

    /**
     * gets a stream of all entity IDs.
     * 
     * @return stream of entity UUIDs.
     */
    @SafeVarargs
    public final List<UUID> getEntitiesWith(Class<? extends GameComponent>... componentTypes) {
        List<UUID> result = new ArrayList<>();

        for (UUID entityId : components.keySet()) {
            Map<Class<? extends GameComponent>, GameComponent> entityComponents = components.get(entityId);
            boolean hasAll = true;

            for (Class<? extends GameComponent> type : componentTypes) {
                if (!entityComponents.containsKey(type)) {
                    hasAll = false;
                    break;
                }
            }

            if (hasAll) {
                result.add(entityId);
            }
        }
        return result;
    }

    public boolean hasEntity(UUID entityId) {
        return components.containsKey(entityId);
    }
}