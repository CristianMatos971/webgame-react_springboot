package com.conquerquest.backend.core.ecs;

import java.io.Serializable;

/**
 * Marker interface for all game components.
 * Used in the Entity-Component-System (ECS) architecture.
 * Components store data relevant to game entities.
 * Implements Serializable for snapshotting and rollback purposes.
 */
public interface GameComponent extends Serializable {

}