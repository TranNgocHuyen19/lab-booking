package iuh.labbooking.configuration.security.handler;

import iuh.labbooking.dto.response.base.ErrorResponse;
import iuh.labbooking.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        log.warn("Authentication failed for request: {} - {}",
                request.getRequestURI(), authException.getMessage());

        ErrorCode errorCode = determineErrorCode(authException);
        HttpStatus status = HttpStatus.valueOf(errorCode.getStatusCode().value());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(errorCode.getCode())
                .status(status.value())
                .path(request.getRequestURI())
                .error(status.getReasonPhrase())
                .message(errorCode.getMessage())
                .build();

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private ErrorCode determineErrorCode(AuthenticationException exception) {
        String message = exception.getMessage() != null ? exception.getMessage().toLowerCase() : "";

        if (message.contains("expired")) {
            return ErrorCode.ACCESS_TOKEN_EXPIRED;
        } else if (message.contains("revoked") || message.contains("blacklist")) {
            return ErrorCode.ACCESS_TOKEN_REVOKED;
        } else if (message.contains("invalid") || message.contains("malformed")) {
            return ErrorCode.ACCESS_TOKEN_INVALID;
        }

        return ErrorCode.UNAUTHENTICATED;
    }
}
