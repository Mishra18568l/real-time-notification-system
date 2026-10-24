package dev.portfolio.notifications;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.*;
@Configuration public class RabbitJsonConfig {
 @Bean Jackson2JsonMessageConverter messageConverter(){return new Jackson2JsonMessageConverter();}
}
