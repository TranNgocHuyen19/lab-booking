package iuh.labbooking.service.booking.validation;

public record DeviceAvailabilityResult(
        Long deviceId,
        int requestedQuantity,
        int availableQuantity,
        boolean available
) {
    public static DeviceAvailabilityResult available(Long deviceId, int requestedQuantity, int availableQuantity) {
        return new DeviceAvailabilityResult(deviceId, requestedQuantity, availableQuantity, true);
    }

    public static DeviceAvailabilityResult insufficient(Long deviceId, int requestedQuantity, int availableQuantity) {
        return new DeviceAvailabilityResult(deviceId, requestedQuantity, availableQuantity, false);
    }
}
