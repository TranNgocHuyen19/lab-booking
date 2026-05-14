package iuh.labbooking.dto.response.base;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

public record ApiResponse<T>(
        int status,
        String message,
        @JsonInclude(JsonInclude.Include.NON_NULL) T data) {
    public ApiResponse(HttpStatus httpStatus, String message, T data) {
        this(httpStatus.value(), message, data);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(HttpStatus.OK, "Success", data);
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(HttpStatus.OK, message, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(HttpStatus.OK, message, data);
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(HttpStatus.CREATED, "Created successfully", data);
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(HttpStatus.CREATED, message, data);
    }
}
