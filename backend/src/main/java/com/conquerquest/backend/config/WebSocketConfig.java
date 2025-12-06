package com.conquerquest.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // where the client will listen for messages from the server (Output)
        config.enableSimpleBroker("/topic");

        // where the client will send messages to the server (Input)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // endpoint for initial WebSocket handshake
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // allow CORS for all origins
                .withSockJS(); // Fallback cases for browsers that don’t support WebSocket
    }
}