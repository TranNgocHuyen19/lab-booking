package iuh.labbooking.service.token;

import iuh.labbooking.model.RefreshTokenSession;

import java.util.Optional;

public interface TokenStoreService {

    void blacklistAccessToken(String jti, String username, Long userId, long ttlSeconds, String reason);

    boolean isAccessTokenBlacklisted(String jti);

    void createRefreshSession(String sessionId, Long userId, String username, String role,
                              String refreshToken, String userAgent, String ipAddress, long ttlSeconds);

    Optional<RefreshTokenSession> findRefreshSession(String sessionId);

    boolean validateRefreshSession(String sessionId, String refreshToken);

    boolean validateRefreshSessionWithBinding(String sessionId, String refreshToken,
                                               String userAgent, String ipAddress);

    void revokeRefreshSession(String sessionId);

    int revokeAllUserRefreshSessions(Long userId);

    void revokeAllUserTokens(String currentAccessJti, String username, Long userId, long accessTtlSeconds);

    String hashSha256(String input);
}
