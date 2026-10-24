package dev.portfolio.notifications;
import org.springframework.context.annotation.*;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.*;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
@Configuration public class RedisConfig {
 @Bean RedisMessageListenerContainer redisContainer(RedisConnectionFactory factory, Gateway gateway){
  RedisMessageListenerContainer c=new RedisMessageListenerContainer();c.setConnectionFactory(factory);
  c.addMessageListener((message,pattern)->gateway.forward(new String(message.getBody(),java.nio.charset.StandardCharsets.UTF_8)),new org.springframework.data.redis.listener.ChannelTopic("notify.websocket"));return c;
 }
}
