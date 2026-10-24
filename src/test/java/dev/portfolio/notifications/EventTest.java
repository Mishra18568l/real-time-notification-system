package dev.portfolio.notifications;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
class EventTest {
 @Test void retryIncrementsAttemptAndPreservesEventId(){var id=UUID.randomUUID();var e=new Event(id,"alice","ORDER","ready",0);var retry=e.nextAttempt();assertEquals(1,retry.attempt());assertEquals(id,retry.eventId());}
}
