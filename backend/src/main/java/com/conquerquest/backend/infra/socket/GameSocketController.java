package com.conquerquest.backend.infra.socket;

import com.conquerquest.backend.core.components.InputComponent;
import com.conquerquest.backend.core.components.InputType;
import com.conquerquest.backend.core.components.PositionComponent;
import com.conquerquest.backend.core.engine.GameLoop;
import com.conquerquest.backend.core.engine.PlayerLifeCycleService;
import com.conquerquest.backend.infra.socket.dto.JoinRequestDTO;
import com.conquerquest.backend.infra.socket.dto.JoinResponseDTO;
import com.conquerquest.backend.infra.socket.dto.MovePayloadDTO;
import com.conquerquest.backend.infra.socket.dto.PacketDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameSocketController {

    private final GameLoop gameLoop;
    private final PlayerLifeCycleService playerService;
    private final SimpMessagingTemplate messagingTemplate; // For sending messages to specific users
    private final ObjectMapper objectMapper;

    /**
     * "The Router": Receives the generic packet, checks the type,
     * and dispatches to the correct handler.
     * route: /app/input
     */
    @MessageMapping("/input")
    public void handleInput(@Payload PacketDTO packet) {
        try {
            if (packet.userId == null || packet.type == null)
                return;

            UUID entityId = UUID.fromString(packet.userId);

            switch (packet.type) {
                case "MOVE" -> handleMovement(entityId, packet.payload);
                case "ATTACK" -> handleAttack(entityId, packet.payload);
                case "USE_ITEM" -> handleItemUsage(entityId, packet.payload);
                default -> log.warn("Unknown packet type received: {}", packet.type);
            }

        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", packet.userId);
        } catch (Exception e) {
            log.error("Error processing input packet: {}", e.getMessage());
        }
    }

    private void handleMovement(UUID entityId, Map<String, Object> payload) {
        // Convert Map -> Record
        MovePayloadDTO dto = objectMapper.convertValue(payload, MovePayloadDTO.class);

        // Map Booleans to Enums
        Set<InputType> activeActions = new HashSet<>();
        if (dto.isDashing()) {
            activeActions.add(InputType.DASH);
        }

        // Note: 'isSprinting' is a state, 'DASH' is an action trigger
        InputComponent newInput = new InputComponent(
                dto.x(),
                dto.y(),
                dto.facingX(),
                dto.facingY(),
                dto.isSprinting(),
                activeActions,
                0, 0);

        // Schedule Update
        gameLoop.addInputTask(() -> {
            gameLoop.getWorldState().addComponent(entityId, newInput);
        });
    }

    private void handleAttack(UUID entityId, Map<String, Object> payload) {
        // Future implementation
        log.info("Attack received for user {}", entityId);
    }

    private void handleItemUsage(UUID entityId, Map<String, Object> payload) {
        // Future implementation
    }

    /**
     * gets called when a player wants to join the game (either as guest or logged
     * in)
     * sending route: /app/join
     * response route: /user/queue/join-response
     */
    @MessageMapping("/join")
    public void handleJoin(@Payload JoinRequestDTO request, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        CompletableFuture<JoinResponseDTO> joinFuture = new CompletableFuture<>();

        gameLoop.addInputTask(() -> {
            try {
                UUID entityId;
                UUID userIdForSession;
                String name = "Unknown";
                if (request.isGuest()) {
                    name = (request.guestName() == null || request.guestName().isBlank())
                            ? "Unknown"
                            : request.guestName();
                    entityId = playerService.spawnGuest(name);

                    var tag = gameLoop.getWorldState().getComponent(entityId,
                            com.conquerquest.backend.core.components.PlayerTagComponent.class);
                    userIdForSession = tag.userId();
                } else {
                    userIdForSession = UUID.fromString(request.userId());
                    entityId = playerService.spawnPlayer(userIdForSession);
                }

                PositionComponent pos = gameLoop.getWorldState().getComponent(entityId, PositionComponent.class);

                JoinResponseDTO response = new JoinResponseDTO(
                        userIdForSession,
                        entityId,
                        name,
                        pos.getX(),
                        pos.getY(),
                        true,
                        "Welcome to ConquerQuest!");

                joinFuture.complete(response);

            } catch (Exception e) {
                joinFuture.completeExceptionally(e);
            }
        });

        // Await the result and send the response back to the client - max(500ms)
        try {
            JoinResponseDTO response = joinFuture.get(500, TimeUnit.MILLISECONDS);

            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/join-response",
                    response,
                    createHeaders(sessionId));

            log.info("Player joined: {}", response.entityId());

        } catch (Exception e) {
            log.error("Timeout or Error processing join request", e);
        }
    }

    // Helper for setting the sessionId in headers when not using full Spring
    // Security
    private org.springframework.messaging.MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}