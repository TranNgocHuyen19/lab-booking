package iuh.labbooking.service.booking.validation;

import iuh.labbooking.exception.ErrorCode;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BookingValidationResult {

    private final List<BookingValidationError> errors = new ArrayList<>();
    private final List<BookingValidationWarning> warnings = new ArrayList<>();
    private final List<ParticipantConflictResult> participantConflicts = new ArrayList<>();

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

    public boolean hasErrors() {
        return !errors.isEmpty();
    }

    public boolean hasWarnings() {
        return !warnings.isEmpty();
    }

    public List<BookingValidationError> errors() {
        return Collections.unmodifiableList(errors);
    }

    public List<BookingValidationWarning> warnings() {
        return Collections.unmodifiableList(warnings);
    }

    public List<ParticipantConflictResult> participantConflicts() {
        return Collections.unmodifiableList(participantConflicts);
    }

    public void merge(BookingValidationResult other) {
        errors.addAll(other.errors);
        warnings.addAll(other.warnings);
        participantConflicts.addAll(other.participantConflicts);
    }
}
