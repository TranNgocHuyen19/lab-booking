package iuh.labbooking.service.token;

import iuh.labbooking.model.BlacklistedAccessToken;
import iuh.labbooking.model.RefreshTokenSession;
import iuh.labbooking.repository.BlacklistedAccessTokenRepository;
import iuh.labbooking.repository.RefreshTokenSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenStoreServiceImpl implements TokenStoreService {

    private final BlacklistedAccessTokenRepository blacklistRepository;
    private final RefreshTokenSessionRepository refreshSessionRepository;

    @Override
    public void blacklistAccessToken(String jti, String username, Long userId, long ttlSeconds, String reason) {
        if (ttlSeconds <= 0) {
            log.debug("Skipping blacklist for expired token jti={}", jti);
            return;
        }

        BlacklistedAccessToken blacklisted = BlacklistedAccessToken.builder()
                .jti(jti)
                .username(username)
                .userId(userId)
                .reason(reason)
                .ttl(ttlSeconds)
                .build();

        blacklistRepository.save(blacklisted);
        log.info("Access token blacklisted: jti={}, username={}, reason={}, ttl={}s", 
                jti, username, reason, ttlSeconds);
    }

    @Override
    public boolean isAccessTokenBlacklisted(String jti) {
        return blacklistRepository.existsById(jti);
    }

    @Override
    public void createRefreshSession(String sessionId, Long userId, String username, String role,
                                      String refreshToken, String userAgent, String ipAddress, long ttlSeconds) {
        long now = System.currentTimeMillis();
        long expiresAt = now + (ttlSeconds * 1000);

        RefreshTokenSession session = RefreshTokenSession.builder()
                .sessionId(sessionId)
                .userId(userId)
                .username(username)
                .role(role)
                .refreshTokenHash(hashSha256(refreshToken))
                .userAgentHash(userAgent != null ? hashSha256(userAgent) : null)
                .ipHash(ipAddress != null ? hashSha256(ipAddress) : null)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .revoked(false)
                .ttl(ttlSeconds)
                .build();

        refreshSessionRepository.save(session);
        log.info("Refresh session created: sessionId={}, userId={}, username={}, ttl={}s", 
                sessionId, userId, username, ttlSeconds);
    }

    @Override
    public Optional<RefreshTokenSession> findRefreshSession(String sessionId) {
        return refreshSessionRepository.findById(sessionId);
    }

    @Override
    public boolean validateRefreshSession(String sessionId, String refreshToken) {
        return refreshSessionRepository.findById(sessionId)
                .map(session -> {
                    if (Boolean.TRUE.equals(session.getRevoked())) {
                        log.warn("Refresh session is revoked: sessionId={}", sessionId);
                        return false;
                    }

                    if (!session.isValid()) {
                        log.warn("Refresh session is expired: sessionId={}", sessionId);
                        return false;
                    }

                    String providedHash = hashSha256(refreshToken);
                    if (!providedHash.equals(session.getRefreshTokenHash())) {
                        log.warn("Refresh token hash mismatch for sessionId={}", sessionId);
                        return false;
                    }

                    return true;
                })
                .orElse(false);
    }

    @Override
    public boolean validateRefreshSessionWithBinding(String sessionId, String refreshToken,
                                                      String userAgent, String ipAddress) {
        log.debug("[VALIDATE] Starting validation for sessionId={}", sessionId);
        
        Optional<RefreshTokenSession> sessionOpt = refreshSessionRepository.findById(sessionId);
        
        if (sessionOpt.isEmpty()) {
            log.warn("[VALIDATE] Session not found in Redis: sessionId={}", sessionId);
            return false;
        }
        
        return sessionOpt.map(session -> {
                    log.debug("[VALIDATE] Found session - userId={}, username={}, revoked={}, expiresAt={}", 
                            session.getUserId(), session.getUsername(), session.getRevoked(), session.getExpiresAt());
                    
                    if (Boolean.TRUE.equals(session.getRevoked())) {
                        log.warn("[VALIDATE] Refresh session is revoked: sessionId={}, userId={}, username={}", 
                                sessionId, session.getUserId(), session.getUsername());
                        return false;
                    }

                    if (!session.isValid()) {
                        long now = System.currentTimeMillis();
                        long timeLeft = session.getExpiresAt() - now;
                        log.warn("[VALIDATE] Refresh session is expired: sessionId={}, userId={}, expiresAt={}, now={}, timeLeft={}ms", 
                                sessionId, session.getUserId(), session.getExpiresAt(), now, timeLeft);
                        return false;
                    }

                    String providedTokenHash = hashSha256(refreshToken);
                    if (!providedTokenHash.equals(session.getRefreshTokenHash())) {
                        log.warn("[VALIDATE] Refresh token hash mismatch for sessionId={}", sessionId);
                        return false;
                    }
                    log.debug("[VALIDATE] Token hash matched");

                    if (session.getUserAgentHash() != null && userAgent != null) {
                        String providedUaHash = hashSha256(userAgent);
                        if (!providedUaHash.equals(session.getUserAgentHash())) {
                            log.warn("[VALIDATE] User-Agent mismatch for sessionId={} - possible token theft!", sessionId);
                        }
                    }

                    if (session.getIpHash() != null && ipAddress != null) {
                        String providedIpHash = hashSha256(ipAddress);
                        if (!providedIpHash.equals(session.getIpHash())) {
                            log.warn("[VALIDATE] IP address mismatch for sessionId={} - user may have changed network", sessionId);
                        }
                    }

                    log.debug("[VALIDATE] Session validation successful for sessionId={}", sessionId);
                    return true;
                })
                .orElse(false);
    }

    @Override
    public void revokeRefreshSession(String sessionId) {
        refreshSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setRevoked(true);
            refreshSessionRepository.save(session);
            log.info("Refresh session revoked: sessionId={}, userId={}", sessionId, session.getUserId());
        });
    }

    @Override
    public int revokeAllUserRefreshSessions(Long userId) {
        List<RefreshTokenSession> sessions = refreshSessionRepository.findByUserId(userId);
        int count = sessions.size();

        if (count > 0) {
            sessions.forEach(session -> session.setRevoked(true));
            refreshSessionRepository.saveAll(sessions);
            log.info("Revoked {} refresh sessions for userId={}", count, userId);
        }

        return count;
    }

    @Override
    public void revokeAllUserTokens(String currentAccessJti, String username, Long userId, long accessTtlSeconds) {
        blacklistAccessToken(currentAccessJti, username, userId, accessTtlSeconds, "REVOKE_ALL");
        int revokedCount = revokeAllUserRefreshSessions(userId);
        log.info("All tokens revoked for userId={}: access blacklisted, {} refresh sessions revoked",
                userId, revokedCount);
    }

    @Override
    public String hashSha256(String input) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
