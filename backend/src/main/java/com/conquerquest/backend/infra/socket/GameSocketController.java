package com.conquerquest.backend.infra.socket;

import com.conquerquest.backend.core.components.InputComponent;
import com.conquerquest.backend.core.components.InputType;
import com.conquerquest.backend.core.components.PositionComponent;
import com.conquerquest.backend.core.engine.GameLoop;
import com.conquerquest.backend.core.engine.PlayerLifeCycleService;
import com.conquerquest.backend.infra.socket.dto.InputDTO;
import com.conquerquest.backend.infra.socket.dto.JoinRequestDTO;
import com.conquerquest.backend.infra.socket.dto.JoinResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Collections;
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

    /**
     * receives player input and updates the corresponding InputComponent
     * route (client send): /app/input
     */
    @MessageMapping("/input")
    public void handleInput(@Payload InputDTO msg) {

        try {
            UUID entityId = UUID.fromString(msg.userId());
            Set<InputType> actions = parseActions(msg.actions());

            InputComponent newInput = new InputComponent(msg.x(), msg.y(), msg.isSprinting(), actions, 0, 0);

            gameLoop.addInputTask(() -> {
                gameLoop.getWorldState().addComponent(entityId, newInput);
            });

        } catch (Exception e) {
            log.error("Error at input's parsing: {}", e.getMessage());
        }
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

                if (request.isGuest()) {
                    String name = (request.guestName() == null || request.guestName().isBlank())
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

    // Helper to parse action strings to InputType enums
    private Set<InputType> parseActions(Set<String> actionStrings) {
        if (actionStrings == null || actionStrings.isEmpty()) {
            return Collections.emptySet();
        }
        return actionStrings.stream()
                .map(str -> {
                    try {
                        return InputType.valueOf(str.toUpperCase());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
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