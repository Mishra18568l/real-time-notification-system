package dev.portfolio.notifications;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record Event(@NotNull UUID eventId, @NotBlank String userId, @NotBlank String type, @NotBlank String message, int attempt) {
 public Event nextAttempt(){return new Event(eventId,userId,type,message,attempt+1);}
}
