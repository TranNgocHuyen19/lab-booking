package iuh.labbooking.dto.response.statistics;

import lombok.Builder;

@Builder
public record SubmissionTrendResponse(
        int hour,
        long count
) {
}
