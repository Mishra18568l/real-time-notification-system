package dev.portfolio.notifications;
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.*;
@Configuration public class MessagingConfig {
 public static final String EX="notify.events", MAIN="notify.main", RETRY_EX="notify.retry", DLX="notify.dead", DEAD="notify.dead.queue";
 @Bean TopicExchange eventExchange(){return new TopicExchange(EX,true,false);}
 @Bean DirectExchange retryExchange(){return new DirectExchange(RETRY_EX,true,false);}
 @Bean DirectExchange deadExchange(){return new DirectExchange(DLX,true,false);}
 @Bean Queue mainQueue(){return QueueBuilder.durable(MAIN).build();}
 @Bean Binding mainBinding(){return BindingBuilder.bind(mainQueue()).to(eventExchange()).with("notification.created");}
 @Bean Queue retry1(){return retryQueue("notify.retry.1",5000);}
 @Bean Queue retry2(){return retryQueue("notify.retry.2",30000);}
 @Bean Queue retry3(){return retryQueue("notify.retry.3",120000);}
 private Queue retryQueue(String name,int ttl){return QueueBuilder.durable(name).ttl(ttl).deadLetterExchange(EX).deadLetterRoutingKey("notification.created").build();}
 @Bean Binding retryBind1(){return BindingBuilder.bind(retry1()).to(retryExchange()).with("retry.1");}
 @Bean Binding retryBind2(){return BindingBuilder.bind(retry2()).to(retryExchange()).with("retry.2");}
 @Bean Binding retryBind3(){return BindingBuilder.bind(retry3()).to(retryExchange()).with("retry.3");}
 @Bean Queue deadQueue(){return QueueBuilder.durable(DEAD).build();}
 @Bean Binding deadBinding(){return BindingBuilder.bind(deadQueue()).to(deadExchange()).with("dead");}
}
