package iuh.labbooking.dto.response.statistics;

public record TypeDistributionInfo(
        String type,
        long count,
        double percentage
) {
}
