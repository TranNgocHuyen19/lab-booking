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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

        private final ObjectMapper objectMapper;

        @Override
        public void handle(HttpServletRequest request,
                        HttpServletResponse response,
                        AccessDeniedException accessDeniedException) throws IOException {

                log.warn("Access denied for request: {} - {}",
                                request.getRequestURI(), accessDeniedException.getMessage());

                ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
                HttpStatus status = HttpStatus.FORBIDDEN;

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(new Date())
                                .code(errorCode.getCode())
                                .status(status.value())
                                .path(request.getRequestURI())
                                .error(status.getReasonPhrase())
                                .message("You do not have permission to access this resource")
                                .build();

                response.setStatus(status.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
}
