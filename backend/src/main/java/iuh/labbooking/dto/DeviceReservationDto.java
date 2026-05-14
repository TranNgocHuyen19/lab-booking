package iuh.labbooking.dto;

public record DeviceReservationDto(
        Long deviceId,
        Long slotId,
        Long reservedQuantity) {
}
