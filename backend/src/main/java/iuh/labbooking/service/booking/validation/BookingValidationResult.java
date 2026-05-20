package iuh.labbooking.service.booking.validation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.ScheduleConflictAction;
import iuh.labbooking.exception.ErrorCode;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record BookingValidationResult(
        List<BookingValidationError> errors,
        List<BookingValidationWarning> warnings,
        List<ParticipantConflictResult> participantConflicts,
        List<ExistingScheduleConflictResult> existingScheduleConflicts
) {

    public BookingValidationResult() {
        this(new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
    }

    public static BookingValidationResult ok() {
        return new BookingValidationResult();
    }

    public void addError(String code, String message) {
        errors.add(BookingValidationError.of(code, message));
    }

    public void addError(ErrorCode errorCode) {
        errors.add(BookingValidationError.of(errorCode));
    }

    public void addError(BookingValidationError error) {
        errors.add(error);
    }

    public void addWarning(String code, String message) {
        warnings.add(BookingValidationWarning.of(code, message));
    }

    public void addWarning(ErrorCode errorCode) {
        warnings.add(BookingValidationWarning.of(errorCode));
    }

    public void addWarning(BookingValidationWarning warning) {
        warnings.add(warning);
    }

    public void addParticipantConflict(ParticipantConflictResult conflict) {
        participantConflicts.add(conflict);
    }

    public void addExistingScheduleConflict(ExistingScheduleConflictResult conflict) {
        existingScheduleConflicts.add(conflict);
    }

    @JsonIgnore
    public boolean hasErrors() {
        return !errors.isEmpty();
    }

    @JsonIgnore
    public boolean hasWarnings() {
        return !warnings.isEmpty();
    }

    public void merge(BookingValidationResult other) {
        errors.addAll(other.errors);
        warnings.addAll(other.warnings);
        participantConflicts.addAll(other.participantConflicts);
        existingScheduleConflicts.addAll(other.existingScheduleConflicts);
    }

    public record BookingValidationError(
            String code,
            String message,
            Long relatedUserId,
            Long relatedBookingRequestId
    ) {
        public static BookingValidationError of(String code, String message) {
            return new BookingValidationError(code, message, null, null);
        }

        public static BookingValidationError of(ErrorCode errorCode) {
            return new BookingValidationError(errorCode.name(), errorCode.getMessage(), null, null);
        }
    }

    public record BookingValidationWarning(
            String code,
            String message,
            Long relatedUserId,
            Long relatedBookingRequestId
    ) {
        public static BookingValidationWarning of(String code, String message) {
            return new BookingValidationWarning(code, message, null, null);
        }

        public static BookingValidationWarning of(ErrorCode errorCode) {
            return new BookingValidationWarning(errorCode.name(), errorCode.getMessage(), null, null);
        }
    }

    public record ParticipantConflictResult(
            Long userId,
            Long conflictingBookingRequestId,
            BookingType conflictingBookingType,
            ParticipantStatus suggestedParticipantStatus,
            String message
    ) {
    }

    public record ExistingScheduleConflictResult(
            String code,
            String message,
            Long userId,
            Long conflictingBookingRequestId,
            BookingType conflictingBookingType,
            LocalDate bookingDate,
            Long slotId,
            ScheduleConflictAction suggestedAction
    ) {
    }

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

    public record RoomCapacityResult(
            Long labRoomId,
            LocalDate bookingDate,
            Long slotId,
            int roomCapacity,
            long occupiedSeats,
            int requestedSeats,
            boolean enoughCapacity
    ) {
        public static RoomCapacityResult of(Long labRoomId,
                                            LocalDate bookingDate,
                                            Long slotId,
                                            int roomCapacity,
                                            long occupiedSeats,
                                            int requestedSeats) {
            return new RoomCapacityResult(
                    labRoomId,
                    bookingDate,
                    slotId,
                    roomCapacity,
                    occupiedSeats,
                    requestedSeats,
                    occupiedSeats + requestedSeats <= roomCapacity);
        }
    }
}

