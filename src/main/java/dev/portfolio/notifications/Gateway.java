
package dev.portfolio.notifications;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class Gateway extends TextWebSocketHandler {

    private static final Logger log =
            LoggerFactory.getLogger(Gateway.class);

    private final ConcurrentMap<String, CopyOnWriteArraySet<WebSocketSession>>
            sessions = new ConcurrentHashMap<>();

    private final ObjectMapper mapper;

    public Gateway(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {

        String userId = (String) session.getAttributes().get("userId");

        log.info("WebSocket connected: userId={}, sessionId={}",
                userId, session.getId());

        if (userId == null || userId.isBlank()) {
            try {
                session.close(CloseStatus.POLICY_VIOLATION);
            } catch (Exception ex) {
                log.error("Failed to close unauthenticated WebSocket", ex);
            }
            return;
        }

        sessions.computeIfAbsent(
                userId,
                key -> new CopyOnWriteArraySet<>()
        ).add(session);
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status) {

        String userId = (String) session.getAttributes().get("userId");

        log.info("WebSocket disconnected: userId={}, sessionId={}",
                userId, session.getId());

        if (userId == null) {
            return;
        }

        var set = sessions.get(userId);

        if (set != null) {
            set.remove(session);

            if (set.isEmpty()) {
                sessions.remove(userId, set);
            }
        }
    }

    public void forward(String json) {

        log.info("Redis message received by Gateway: {}", json);

        try {
            JsonNode data = mapper.readTree(json);

            String userId = data.path("userId").asText();

            var userSessions = sessions.get(userId);

            if (userSessions == null || userSessions.isEmpty()) {
                log.warn("No active WebSocket sessions for userId={}", userId);
                return;
            }

            log.info("Found {} WebSocket sessions for userId={}",
                    userSessions.size(), userId);

            for (WebSocketSession session : userSessions) {
                try {
                    if (session.isOpen()) {
                        synchronized (session) {
                            session.sendMessage(new TextMessage(json));
                        }

                        log.info("Notification sent to WebSocket session={}",
                                session.getId());
                    } else {
                        log.warn("WebSocket session is closed: {}",
                                session.getId());
                    }
                } catch (Exception ex) {
                    log.error("WebSocket delivery failed", ex);
                }
            }

        } catch (Exception ex) {
            log.error("Failed to process Redis notification", ex);
        }
    }
}
