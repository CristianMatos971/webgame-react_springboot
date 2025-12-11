import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { gameEvents } from '../events/GameEventManager';

class SocketClient {
    constructor() {
        this.client = null;
        this.connected = false;
        this.entityId = null;

        this.onGameState = null; // used to notify game state updates
        this.onJoin = null;      // used to notify join response
    }

    connect(playerName, isGuest = true) {
        // Stomp Configuration
        this.client = new Client({

            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            onConnect: () => {
                console.log('🔗 WebSocket Connected!');
                this.connected = true;

                // stay listening to server messages
                this.client.subscribe('/user/queue/join-response', (message) => {
                    const response = JSON.parse(message.body);
                    if (response.success) {
                        this.entityId = response.entityId;
                        console.log('Joined Game - ID:', this.entityId);

                        // tells gameCanvas about join success
                        if (this.onJoin) this.onJoin(response);

                        const myUserId = response.userId;

                        //debug
                        console.log("--> JOIN SUCCESS. UserID :", myUserId);
                        console.log("--> subscribing to topic:", `/topic/stats/${myUserId}`);

                        this.client.subscribe(`/topic/stats/${myUserId}`, (statsMsg) => {
                            const statsData = JSON.parse(statsMsg.body);
                            gameEvents.emit("PLAYER_STATS_UPDATE", statsData);
                        });
                    }
                });

                // listen to gameState (Global - Broadcast)
                this.client.subscribe('/topic/gamestate', (message) => {
                    if (this.onGameState) {
                        this.onGameState(JSON.parse(message.body));
                    }
                });

                this.sendJoinRequest(playerName, isGuest);
            },

            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        this.client.activate();
    }

    sendJoinRequest(name, isGuest) {
        this.client.publish({
            destination: '/app/join',
            body: JSON.stringify({
                userId: null, // null for guest users
                guestName: name,
                isGuest: isGuest
            })
        });
    }

    // called by game loop to send player inputs 60 times per second
    sendInput(type, inputData) {
        if (!this.connected || !this.entityId) return;

        this.client.publish({
            destination: '/app/input',
            body: JSON.stringify({
                userId: this.entityId,
                type,
                payload: { ...inputData }
            })
        });
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
        }
    }
}

export const socketClient = new SocketClient();