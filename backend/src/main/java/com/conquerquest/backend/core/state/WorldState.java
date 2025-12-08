package com.conquerquest.backend.core.state;

import com.conquerquest.backend.core.ecs.GameComponent;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

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

    // otimization (Index): ComponentClass -> Set<EntityID>
    private final Map<Class<? extends GameComponent>, Set<UUID>> componentIndex = new ConcurrentHashMap<>();

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
        Map<Class<? extends GameComponent>, GameComponent> entityComponents = components.get(entityId);
        if (entityComponents != null) {
            for (Class<? extends GameComponent> type : entityComponents.keySet()) {
                componentIndex.get(type).remove(entityId);
            }
        }
        components.remove(entityId);
    }

    /**
     * adds a component to an entity or updates it if it already exists.
     */
    public void addComponent(UUID entityId, GameComponent component) {
        if (components.containsKey(entityId)) {
            // adds/updates component in the entity's component map
            components.get(entityId).put(component.getClass(), component);

            // adds entity to the component index
            componentIndex.computeIfAbsent(component.getClass(), k -> new CopyOnWriteArraySet<>())
                    .add(entityId);
        }
    }

    public void removeComponent(UUID entityId, Class<? extends GameComponent> componentClass) {
        if (components.containsKey(entityId)) {
            components.get(entityId).remove(componentClass);

            if (componentIndex.containsKey(componentClass)) {
                componentIndex.get(componentClass).remove(entityId);
            }
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
     * gets a list of entity IDs that have all the specified component types.
     */
    @SafeVarargs
    public final List<UUID> getEntitiesWith(Class<? extends GameComponent>... componentTypes) {
        if (componentTypes.length == 0)
            return Collections.emptyList();

        Set<UUID> candidates = componentIndex.get(componentTypes[0]);
        if (candidates == null || candidates.isEmpty())
            return Collections.emptyList();

        List<UUID> result = new ArrayList<>(candidates);

        for (int i = 1; i < componentTypes.length; i++) {
            Set<UUID> nextSet = componentIndex.get(componentTypes[i]);
            if (nextSet == null || nextSet.isEmpty())
                return Collections.emptyList();

            // removes entities that do not have the current component type
            result.retainAll(nextSet);
        }

        return result;
    }

    public boolean hasEntity(UUID entityId) {
        return components.containsKey(entityId);
    }

    // helper for snapshotting the entire world state
    public Map<UUID, Map<Class<? extends GameComponent>, GameComponent>> getAllEntities() {
        return Collections.unmodifiableMap(components);
    }
}