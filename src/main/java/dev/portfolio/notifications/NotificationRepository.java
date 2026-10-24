package dev.portfolio.notifications;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification,UUID>{
 boolean existsByEventId(UUID eventId);
 List<Notification> findTop50ByUserIdOrderByCreatedAtDesc(String userId);
}
