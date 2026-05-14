package iuh.labbooking.dto.response.user;

import lombok.Builder;

@Builder
public record UserSummaryResponse(
        Long id,
        String username,
        String fullName
) {
}
