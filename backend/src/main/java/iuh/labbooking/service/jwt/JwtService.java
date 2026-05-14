package iuh.labbooking.service.jwt;

import com.nimbusds.jose.JOSEException;
import iuh.labbooking.dto.jwt.JwtInformation;
import iuh.labbooking.dto.jwt.TokenPayload;
import iuh.labbooking.model.User;

import java.text.ParseException;
import java.util.List;

public interface JwtService {

    TokenPayload generateAccessToken(User user);

    TokenPayload generateRefreshToken(User user, String sessionId);

    JwtInformation parseAccessToken(String token) throws ParseException, JOSEException;

    JwtInformation parseRefreshToken(String token) throws ParseException, JOSEException;

    boolean verifyAccessToken(String token) throws ParseException, JOSEException;

    boolean verifyRefreshToken(String token) throws ParseException, JOSEException;

    String extractUsername(String token) throws ParseException;

    Long extractUserId(String token) throws ParseException;

    List<String> extractRoles(String token) throws ParseException;

    String extractSessionId(String token) throws ParseException;

    long getRemainingTtlSeconds(String token) throws ParseException;

    long getRefreshTokenExpirationSeconds();
}

