package iuh.labbooking.dto.response.configuration;

import java.time.LocalDateTime;

public record SystemConfigHistoryResponse(
        Long systemConfigHistoryId,
        String configKey,
        String configName,
        String oldValue,
        String newValue,
        String changedBy,
        LocalDateTime changedAt,
        String reason,
        String category
) {
}
