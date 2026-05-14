package iuh.labbooking.dto.response.base;

import lombok.Builder;

import java.util.Date;

@Builder
public record ErrorResponse(
                Date timestamp,
                int code,
                int status,
                String path,
                String error,
                String message,
                Object data) {
}
