
package dev.portfolio.notifications;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class NotificationService {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository repo;
    private final StringRedisTemplate redis;
    private final RabbitTemplate rabbit;
    private final ObjectMapper mapper;

    public NotificationService(
            NotificationRepository repo,
            StringRedisTemplate redis,
            RabbitTemplate rabbit,
            ObjectMapper mapper) {

        this.repo = repo;
        this.redis = redis;
        this.rabbit = rabbit;
        this.mapper = mapper;
    }

    public void process(Event e) throws Exception {

        log.info("Received event: eventId={}, userId={}",
                e.eventId(), e.userId());

        String key = "notify:done:" + e.eventId();

        if (Boolean.TRUE.equals(redis.hasKey(key))
                || repo.existsByEventId(e.eventId())) {

            log.info("Skipping duplicate event: {}", e.eventId());
            return;
        }

        Notification n;

        try {
            n = repo.saveAndFlush(new Notification(e));

            log.info("Saved notification: eventId={}", e.eventId());

        } catch (DataIntegrityViolationException duplicate) {

            log.info("Duplicate database event: {}", e.eventId());
            return;
        }

        redis.opsForValue().set(key, "1", Duration.ofDays(7));

        log.info("Publishing notification to Redis: eventId={}",
                e.eventId());

        Long subscribers = redis.convertAndSend(
                "notify.websocket",
                mapper.writeValueAsString(n)
        );

        log.info("Redis publish completed: eventId={}, subscribers={}",
                e.eventId(), subscribers);
    }

    public void routeFailure(Event e, Exception ex) {

        log.error(
                "Notification processing failed: eventId={}, attempt={}",
                e.eventId(),
                e.attempt(),
                ex
        );

        if (e.attempt() >= 3) {
            rabbit.convertAndSend(MessagingConfig.DLX, "dead", e);
            return;
        }

        int next = e.attempt() + 1;

        rabbit.convertAndSend(
                MessagingConfig.RETRY_EX,
                "retry." + next,
                e.nextAttempt()
        );
    }
}
