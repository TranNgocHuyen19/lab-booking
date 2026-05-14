package iuh.labbooking.dto.response.dashboard;

public record KpiWithGrowth(
        double value,
        Double growth,
        boolean isUp
) {
}
