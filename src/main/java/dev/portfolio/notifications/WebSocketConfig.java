
package dev.portfolio.notifications;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final Gateway gateway;
    private final WebSocketTicketService tickets;

    public WebSocketConfig(
            Gateway gateway,
            WebSocketTicketService tickets) {
        this.gateway = gateway;
        this.tickets = tickets;
    }

    @Override
    public void registerWebSocketHandlers(
            WebSocketHandlerRegistry registry) {

        registry.addHandler(gateway, "/ws")
                .addInterceptors(new HandshakeInterceptor() {

                    @Override
                    public boolean beforeHandshake(
                            ServerHttpRequest request,
                            ServerHttpResponse response,
                            WebSocketHandler handler,
                            Map<String, Object> attributes) {

                        String ticket = getQueryParameter(
                                request.getURI().getRawQuery(),
                                "ticket"
                        );

                        String username = tickets.consume(ticket);

                        if (username == null || username.isBlank()) {
                            response.setStatusCode(HttpStatus.UNAUTHORIZED);
                            return false;
                        }

                        attributes.put("userId", username);
                        return true;
                    }

                    @Override
                    public void afterHandshake(
                            ServerHttpRequest request,
                            ServerHttpResponse response,
                            WebSocketHandler handler,
                            Exception exception) {
                    }
                })
                .setAllowedOriginPatterns(
    "http://localhost:5173",
    "http://127.0.0.1:5173"
);
    }

    private static String getQueryParameter(
            String query,
            String name) {

        if (query == null) {
            return null;
        }

        for (String part : query.split("&")) {
            String[] pair = part.split("=", 2);

            if (pair.length == 2
                    && pair[0].equals(name)) {
                return URLDecoder.decode(
                        pair[1],
                        StandardCharsets.UTF_8
                );
            }
        }

        return null;
    }
}
