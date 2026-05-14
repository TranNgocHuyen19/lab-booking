package iuh.labbooking.exception;

import lombok.extern.slf4j.Slf4j;
import iuh.labbooking.dto.response.base.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.nio.file.AccessDeniedException;
import java.util.Date;

/*
 * Global exception handler for controller-level exceptions
 * Note: Security filter exceptions (401/403) are handled by JwtAuthenticationEntryPoint and JwtAccessDeniedHandler
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ==================== APP EXCEPTION ====================

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException e, WebRequest request) {
        log.warn("AppException: {}", e.getMessage());
        ErrorCode errorCode = e.getErrorCode();
        HttpStatus status = HttpStatus.valueOf(errorCode.getStatusCode().value());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(errorCode.getCode())
                .status(status.value())
                .path(extractPath(request))
                .error(status.getReasonPhrase())
                .message(e.getMessage())
                .data(e.getData())
                .build();

        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(Exception e, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(ErrorCode.INVALID_CREDENTIALS.getCode())
                .status(HttpStatus.UNAUTHORIZED.value())
                .path(extractPath(request))
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    // ==================== VALIDATION EXCEPTIONS ====================

    @ExceptionHandler({
            ConstraintViolationException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentNotValidException.class
    })
    public ResponseEntity<ErrorResponse> handleValidationException(Exception e, WebRequest request) {
        log.warn("Validation error: {}", e.getMessage());
        String message = e.getMessage();
        String error = "Invalid Data";

        if (e instanceof MethodArgumentNotValidException) {
            // Extract the actual validation message
            int start = message.lastIndexOf("[") + 1;
            int end = message.lastIndexOf("]") - 1;
            if (start > 0 && end > start) {
                message = message.substring(start, end);
            }
            error = "Invalid Payload";
        } else if (e instanceof MissingServletRequestParameterException) {
            error = "Invalid Parameter";
        } else if (e instanceof ConstraintViolationException) {
            error = "Invalid Parameter";
            int spaceIndex = message.indexOf(" ");
            if (spaceIndex > 0) {
                message = message.substring(spaceIndex + 1);
            }
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(ErrorCode.VALIDATION_ERROR.getCode())
                .status(HttpStatus.BAD_REQUEST.value())
                .path(extractPath(request))
                .error(error)
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    // ==================== ACCESS DENIED (Controller level) ====================

    @ExceptionHandler({ AccessDeniedException.class, AuthorizationDeniedException.class })
    public ResponseEntity<ErrorResponse> handleAccessDenied(Exception e, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(ErrorCode.UNAUTHORIZED.getCode())
                .status(HttpStatus.FORBIDDEN.value())
                .path(extractPath(request))
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message("You do not have permission to access this resource")
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleLockFailure(Exception e, WebRequest request) {
        ErrorCode errorCode = ErrorCode.SYSTEM_BUSY;
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(errorCode.getCode())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .path(extractPath(request))
                .error(HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
    }

    // ==================== GENERIC EXCEPTION ====================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e, WebRequest request) {
        log.error("Unhandled Exception at {}: ", extractPath(request), e);
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .path(extractPath(request))
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    // ==================== HELPER METHODS ====================

    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }
}
