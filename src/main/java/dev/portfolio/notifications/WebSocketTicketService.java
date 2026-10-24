
package dev.portfolio.notifications;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketTicketService {

    private static final String PREFIX = "notify:ws-ticket:";
    private static final Duration TTL = Duration.ofSeconds(30);

    private final StringRedisTemplate redis;
    private final SecureRandom random = new SecureRandom();

    public WebSocketTicketService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public String issue(String username) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        String ticket = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        redis.opsForValue().set(
                PREFIX + ticket,
                username,
                TTL
        );

        return ticket;
    }

    public String consume(String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return null;
        }

        // Redis GETDEL atomically reads and deletes the ticket.
        return redis.opsForValue().getAndDelete(PREFIX + ticket);
    }
}

