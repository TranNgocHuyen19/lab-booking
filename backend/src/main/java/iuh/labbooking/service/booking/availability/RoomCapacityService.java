package iuh.labbooking.service.booking.availability;

import iuh.labbooking.dto.request.booking.CreateBookingSlot;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.service.booking.conflict.BookingConflictQueryService;
import iuh.labbooking.service.booking.validation.BookingValidationResult.RoomCapacityResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomCapacityService {

    private final BookingConflictQueryService conflictQueryService;
    private final LabRoomRepository labRoomRepository;

    public List<RoomCapacityResult> checkCapacity(BookingCreationContext context, int requestedSeats) {
        LabRoom labRoom = labRoomRepository.findById(context.labRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        return context.slots().stream()
                .map(slot -> {
                    long occupied = conflictQueryService.countOccupiedSeats(
                            context.labRoomId(),
                            slot.bookingDate(),
                            slot.slotId());
                    return RoomCapacityResult.of(
                            context.labRoomId(),
                            slot.bookingDate(),
                            slot.slotId(),
                            labRoom.getCapacity(),
                            occupied,
                            requestedSeats);
                })
                .toList();
    }

}
