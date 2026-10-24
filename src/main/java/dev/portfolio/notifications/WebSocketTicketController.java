
package dev.portfolio.notifications;

import java.util.Map;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WebSocketTicketController {

    private final WebSocketTicketService tickets;

    public WebSocketTicketController(WebSocketTicketService tickets) {
        this.tickets = tickets;
    }

    @PostMapping("/ws-ticket")
    public ResponseEntity<Map<String, String>> issueTicket(
            @AuthenticationPrincipal Jwt jwt) {

        String ticket = tickets.issue(jwt.getSubject());

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(Map.of("ticket", ticket));
    }
}
