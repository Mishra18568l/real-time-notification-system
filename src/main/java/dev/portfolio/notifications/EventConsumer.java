package dev.portfolio.notifications;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
@Component public class EventConsumer {
 private final NotificationService service;
 public EventConsumer(NotificationService service){this.service=service;}
 @RabbitListener(queues=MessagingConfig.MAIN)
 public void consume(Event event){try{service.process(event);}catch(Exception ex){service.routeFailure(event,ex);}}
}
