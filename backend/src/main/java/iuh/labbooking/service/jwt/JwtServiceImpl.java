package iuh.labbooking.service.jwt;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import iuh.labbooking.dto.jwt.JwtInformation;
import iuh.labbooking.dto.jwt.TokenPayload;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.User;
import iuh.labbooking.service.token.TokenStoreService;
import iuh.labbooking.util.DurationParserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtServiceImpl implements JwtService {

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLES = "roles";
    private static final String CLAIM_TYPE = "typ";
    private static final String CLAIM_SESSION_ID = "sid";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    @Value("${jwt.access.secret}")
    private String accessSecret;

    @Value("${jwt.access.expiration}")
    private String accessExpiration;

    @Value("${jwt.refresh.secret}")
    private String refreshSecret;

    @Value("${jwt.refresh.expiration}")
    private String refreshExpiration;

    @Value("${jwt.issuer:lab-booking-service}")
    private String issuer;

    private final TokenStoreService tokenStoreService;

    @Override
    public TokenPayload generateAccessToken(User user) {
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS512)
                .type(JOSEObjectType.JWT)
                .build();

        Date issueTime = new Date();
        long expirationMillis = DurationParserUtil.parseToMilliseconds(accessExpiration);
        Date expirationTime = new Date(issueTime.getTime() + expirationMillis);
        String jwtId = UUID.randomUUID().toString();

        List<String> roles = user.getRole() != null
                ? List.of("ROLE_" + user.getRole().getRoleName().toUpperCase())
                : Collections.emptyList();

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer(issuer)
                .issueTime(issueTime)
                .expirationTime(expirationTime)
                .jwtID(jwtId)
                .claim(CLAIM_USER_ID, user.getUserId())
                .claim(CLAIM_ROLES, roles)
                .claim(CLAIM_TYPE, TOKEN_TYPE_ACCESS)
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            JWSSigner signer = new MACSigner(accessSecret.getBytes());
            jwsObject.sign(signer);
        } catch (JOSEException e) {
            log.error("Error signing access token for user: {}", user.getUsername(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to generate access token");
        }

        log.debug("Generated access token for user: {}, jti: {}, expires: {}",
                user.getUsername(), jwtId, expirationTime);

        return TokenPayload.builder()
                .token(jwsObject.serialize())
                .jwtId(jwtId)
                .expirationTime(expirationTime)
                .build();
    }

    @Override
    public TokenPayload generateRefreshToken(User user, String sessionId) {
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS512)
                .type(JOSEObjectType.JWT)
                .build();

        Date issueTime = new Date();
        long expirationMillis = DurationParserUtil.parseToMilliseconds(refreshExpiration);
        Date expirationTime = new Date(issueTime.getTime() + expirationMillis);
        String jwtId = UUID.randomUUID().toString();

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer(issuer)
                .issueTime(issueTime)
                .expirationTime(expirationTime)
                .jwtID(jwtId)
                .claim(CLAIM_USER_ID, user.getUserId())
                .claim(CLAIM_SESSION_ID, sessionId)
                .claim(CLAIM_TYPE, TOKEN_TYPE_REFRESH)
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            JWSSigner signer = new MACSigner(refreshSecret.getBytes());
            jwsObject.sign(signer);
        } catch (JOSEException e) {
            log.error("Error signing refresh token for user: {}", user.getUsername(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to generate refresh token");
        }

        log.debug("Generated refresh token for user: {}, sessionId: {}, expires: {}",
                user.getUsername(), sessionId, expirationTime);

        return TokenPayload.builder()
                .token(jwsObject.serialize())
                .jwtId(jwtId)
                .expirationTime(expirationTime)
                .build();
    }

    @Override
    public JwtInformation parseAccessToken(String token) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(accessSecret.getBytes());

        if (!signedJWT.verify(verifier)) {
            log.warn("Access token signature verification failed");
            throw new OAuth2AuthenticationException(
                    new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "Access token invalid", null)
            );
        }

        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

        String tokenType = claims.getStringClaim(CLAIM_TYPE);
        if (!TOKEN_TYPE_ACCESS.equals(tokenType)) {
            log.warn("Invalid token type: expected 'access', got '{}'", tokenType);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "Access token invalid type", null)
            );
        }

        return JwtInformation.builder()
                .jwtId(claims.getJWTID())
                .username(claims.getSubject())
                .userId(claims.getLongClaim(CLAIM_USER_ID))
                .roles(claims.getStringListClaim(CLAIM_ROLES))
                .issueTime(claims.getIssueTime())
                .expirationTime(claims.getExpirationTime())
                .build();
    }

    @Override
    public JwtInformation parseRefreshToken(String token) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(refreshSecret.getBytes());

        if (!signedJWT.verify(verifier)) {
            log.warn("Refresh token signature verification failed");
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

        String tokenType = claims.getStringClaim(CLAIM_TYPE);
        if (!TOKEN_TYPE_REFRESH.equals(tokenType)) {
            log.warn("Invalid token type: expected 'refresh', got '{}'", tokenType);
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        return JwtInformation.builder()
                .jwtId(claims.getJWTID())
                .username(claims.getSubject())
                .userId(claims.getLongClaim(CLAIM_USER_ID))
                .sessionId(claims.getStringClaim(CLAIM_SESSION_ID))
                .issueTime(claims.getIssueTime())
                .expirationTime(claims.getExpirationTime())
                .build();
    }

    @Override
    public boolean verifyAccessToken(String token) throws ParseException, JOSEException {
        JwtInformation jwtInfo = parseAccessToken(token);

        if (jwtInfo.expirationTime().before(new Date())) {
            log.debug("Access token expired: jti={}", jwtInfo.jwtId());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "Access token expired", null)
            );
        }

        if (tokenStoreService.isAccessTokenBlacklisted(jwtInfo.jwtId())) {
            log.debug("Access token blacklisted: jti={}", jwtInfo.jwtId());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "Access token revoked", null)
            );
        }

        return true;
    }

    @Override
    public boolean verifyRefreshToken(String token) throws ParseException, JOSEException {
        JwtInformation jwtInfo = parseRefreshToken(token);

        if (jwtInfo.expirationTime().before(new Date())) {
            log.debug("Refresh token expired: jti={}", jwtInfo.jwtId());
            throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        return true;
    }

    @Override
    public String extractUsername(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getSubject();
    }

    @Override
    public Long extractUserId(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getLongClaim(CLAIM_USER_ID);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        List<String> roles = (List<String>) signedJWT.getJWTClaimsSet().getClaim(CLAIM_ROLES);
        return roles != null ? roles : Collections.emptyList();
    }

    @Override
    public String extractSessionId(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getStringClaim(CLAIM_SESSION_ID);
    }

    @Override
    public long getRemainingTtlSeconds(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        long remainingMs = expirationTime.getTime() - System.currentTimeMillis();
        return Math.max(0, remainingMs / 1000);
    }

    @Override
    public long getRefreshTokenExpirationSeconds() {
        return DurationParserUtil.parseToSeconds(refreshExpiration);
    }
}
