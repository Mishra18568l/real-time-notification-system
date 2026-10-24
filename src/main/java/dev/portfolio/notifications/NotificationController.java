
package dev.portfolio.notifications;

import jakarta.validation.Valid;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final RabbitTemplate rabbit;
    private final NotificationRepository repo;

    public NotificationController(
            RabbitTemplate rabbit,
            NotificationRepository repo) {
        this.rabbit = rabbit;
        this.repo = repo;
    }

    @PostMapping("/events")
    public ResponseEntity<Map<String, Object>> publish(
            @Valid @RequestBody Event event) {

        Event initial = new Event(
                event.eventId(),
                event.userId(),
                event.type(),
                event.message(),
                0
        );

        rabbit.convertAndSend(
                MessagingConfig.EX,
                "notification.created",
                initial
        );

        return ResponseEntity.accepted().body(
                Map.of(
                        "eventId", initial.eventId(),
                        "status", "QUEUED"
                )
        );
    }

    @GetMapping("/me/notifications")
    public List<Notification> myNotifications(
            @AuthenticationPrincipal Jwt jwt) {

        String username = jwt.getSubject();

        return repo.findTop50ByUserIdOrderByCreatedAtDesc(
                username
        );
    }
}
