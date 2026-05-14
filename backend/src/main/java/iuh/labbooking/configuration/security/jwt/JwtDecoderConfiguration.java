package iuh.labbooking.configuration.security.jwt;

import com.nimbusds.jose.JOSEException;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.service.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtDecoderConfiguration implements JwtDecoder {

    @Value("${jwt.access.secret}")
    private String accessSecret;

    private final JwtService jwtService;
    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {
        log.debug("Decoding JWT token");
        
        try {
            jwtService.verifyAccessToken(token);

            if (Objects.isNull(nimbusJwtDecoder)) {
                SecretKey secretKey = new SecretKeySpec(
                        accessSecret.getBytes(StandardCharsets.UTF_8), 
                        "HmacSHA512"
                );
                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
                        .macAlgorithm(MacAlgorithm.HS512)
                        .build();
            }

            return nimbusJwtDecoder.decode(token);

        } catch (JwtException | OAuth2AuthenticationException e) {
            throw e;
        } catch (ParseException | JOSEException e) {
            log.error("Token parsing/verification failed", e);
            throw new JwtException("Invalid token format", e);
        }
    }
}
