package iuh.labbooking.dto.request.configuration;

public record UpdateConfigFieldRequest(
        Double value,
        String reason
) {
}
