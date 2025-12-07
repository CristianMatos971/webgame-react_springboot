package com.conquerquest.backend.infra.socket;

import com.conquerquest.backend.core.components.InputComponent;
import com.conquerquest.backend.core.components.InputType;
import com.conquerquest.backend.core.components.PositionComponent;
import com.conquerquest.backend.core.engine.PlayerLifeCycleService;
import com.conquerquest.backend.core.state.WorldState;
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
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameSocketController {

    private final WorldState worldState;
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

            if (!worldState.hasEntity(entityId)) {
                log.warn("Entity doesn't exist in the world: {}", entityId);
                return;
            }

            // Convert actions from String to InputType enum
            Set<InputType> actions = Collections.emptySet();
            if (msg.actions() != null && !msg.actions().isEmpty()) {
                actions = msg.actions().stream()
                        .map(actionStr -> {
                            try {
                                return InputType.valueOf(actionStr.toUpperCase());
                            } catch (IllegalArgumentException e) {
                                return null; // ignores invalid actions
                            }
                        })
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toSet());
            }

            // updates the InputComponent
            InputComponent newInput = new InputComponent(
                    msg.x(),
                    msg.y(),
                    msg.isSprinting(),
                    actions,
                    0, 0);

            worldState.addComponent(entityId, newInput);

        } catch (Exception e) {
            log.error("Erro no input: {}", e.getMessage());
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
        try {
            UUID entityId;
            UUID userIdForSession;

            if (request.isGuest()) {
                // geust mode: spawn guest with provided name or "Unknown"
                String name = (request.guestName() == null || request.guestName().isBlank())
                        ? "Unknown"
                        : request.guestName();
                entityId = playerService.spawnGuest(name);

                var tag = worldState.getComponent(entityId,
                        com.conquerquest.backend.core.components.PlayerTagComponent.class);
                userIdForSession = tag.userId();

            } else {
                userIdForSession = UUID.fromString(request.userId());
                entityId = playerService.spawnPlayer(userIdForSession);
            }

            PositionComponent pos = worldState.getComponent(entityId, PositionComponent.class);

            JoinResponseDTO response = new JoinResponseDTO(
                    userIdForSession != null ? userIdForSession : null,
                    entityId,
                    pos.x(),
                    pos.y(),
                    true,
                    "Welcome to ConquerQuest!");

            // sending the response back to the user who requested to join
            String sessionId = headerAccessor.getSessionId();

            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/join-response",
                    response,
                    createHeaders(sessionId));

            log.info("Join response sent to session: {}", sessionId);

        } catch (Exception e) {
            log.error("Error joining game", e);
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