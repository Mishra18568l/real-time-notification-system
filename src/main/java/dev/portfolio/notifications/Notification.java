package dev.portfolio.notifications;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="notifications",uniqueConstraints=@UniqueConstraint(columnNames="event_id"))
public class Notification {
 @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
 @Column(name="event_id",nullable=false,unique=true) public UUID eventId;
 @Column(nullable=false) public String userId;
 @Column(nullable=false) public String type;
 @Column(nullable=false,length=2000) public String message;
 @Column(nullable=false) public Instant createdAt=Instant.now();
 public Notification() {}
 public Notification(Event e){eventId=e.eventId();userId=e.userId();type=e.type();message=e.message();}
}
