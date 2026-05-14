package iuh.labbooking.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.util.concurrent.TimeUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RedisHash("access:blacklist")
public class BlacklistedAccessToken {

    @Id
    private String jti;

    private String username;

    private Long userId;

    private String reason;

    @TimeToLive(unit = TimeUnit.SECONDS)
    private Long ttl;
}
