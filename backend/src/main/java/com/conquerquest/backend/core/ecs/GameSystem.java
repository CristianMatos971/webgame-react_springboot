package com.conquerquest.backend.core.ecs;

import com.conquerquest.backend.core.state.WorldState;

/**
 * Interface for all game systems.
 * Used in the Entity-Component-System (ECS) architecture.
 */
public interface GameSystem {

    /**
     * executes one update cycle of the system.
     * 
     * @param state the current world state.
     * @param delta the time elapsed since the last update in seconds.
     */
    void update(WorldState state, float delta);
}