package iuh.labbooking.dto.response.device;

public record RoomAllocationResponse(
        Long labRoomId,
        String labRoomName,
        Integer quantity
) {
}
