package iuh.labbooking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    // ==================== COMMON: SYSTEM (1000-1099) ====================
    UNCATEGORIZED_EXCEPTION(1000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR(1002, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE(1003, "Service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    SYSTEM_BUSY(1004, "System is busy processing too many requests. Please try again later", HttpStatus.SERVICE_UNAVAILABLE),

    // ==================== COMMON: VALIDATION (1100-1199) ====================
    INVALID_REQUEST(1100, "Invalid request", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR(1101, "Validation error", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL_FORMAT(1102, "Invalid email format", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_FORMAT(1103, "Invalid phone number format", HttpStatus.BAD_REQUEST),
    INVALID_DATE_FORMAT(1104, "Invalid date format", HttpStatus.BAD_REQUEST),
    INVALID_TIME_FORMAT(1105, "Invalid time format", HttpStatus.BAD_REQUEST),
    FIELD_REQUIRED(1106, "Required field is missing", HttpStatus.BAD_REQUEST),
    FIELD_TOO_LONG(1107, "Field exceeds maximum length", HttpStatus.BAD_REQUEST),
    FIELD_TOO_SHORT(1108, "Field is below minimum length", HttpStatus.BAD_REQUEST),
    INVALID_TIME_RANGE(1109, "End time must be after start time", HttpStatus.BAD_REQUEST),

    // ==================== COMMON: AUTH / SECURITY (1200-1299) ====================
    UNAUTHENTICATED(1200, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1201, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1202, "Invalid username or password", HttpStatus.BAD_REQUEST),

    // Access Token errors
    ACCESS_TOKEN_INVALID(1203, "Access token is invalid", HttpStatus.UNAUTHORIZED),
    ACCESS_TOKEN_EXPIRED(1204, "Access token has expired", HttpStatus.UNAUTHORIZED),
    ACCESS_TOKEN_REVOKED(1205, "Access token has been revoked", HttpStatus.UNAUTHORIZED),

    // Refresh Token errors
    REFRESH_TOKEN_INVALID(1206, "Refresh token is invalid", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(1207, "Refresh token has expired", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_REVOKED(1208, "Refresh token has been revoked", HttpStatus.UNAUTHORIZED),

    // Account status
    ACCOUNT_DISABLED(1209, "Account has been disabled", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED(1210, "Account has been locked", HttpStatus.FORBIDDEN),
    SESSION_EXPIRED(1211, "Session has expired", HttpStatus.UNAUTHORIZED),
    LOGIN_ROLE_NOT_ALLOWED(1212, "Login role not allowed", HttpStatus.FORBIDDEN),
    OTP_INVALID(1213, "Invalid or expired OTP", HttpStatus.BAD_REQUEST),
    RESET_TOKEN_INVALID(1214, "Invalid or expired reset token", HttpStatus.BAD_REQUEST),
    OTP_COOLDOWN_ACTIVE(1215, "Please wait before requesting a new OTP", HttpStatus.TOO_MANY_REQUESTS),
    OTP_MAX_ATTEMPTS_EXCEEDED(1216, "Too many failed OTP attempts. Please try again later",
            HttpStatus.TOO_MANY_REQUESTS),
    OTP_SEND_FAILED(1217, "Failed to send OTP. Please try again", HttpStatus.INTERNAL_SERVER_ERROR),

    // ==================== ENTITY: USER (2000-2099) ====================
    USER_NOT_FOUND(2000, "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(2001, "User already exists", HttpStatus.CONFLICT),
    USERNAME_ALREADY_EXISTS(2002, "Username already exists", HttpStatus.CONFLICT),
    IUH_EMAIL_ALREADY_EXISTS(2003, "IUH email already exists", HttpStatus.CONFLICT),
    PERSONAL_EMAIL_ALREADY_EXISTS(2004, "Personal email already exists", HttpStatus.CONFLICT),
    PHONE_ALREADY_EXISTS(2005, "Phone number already exists", HttpStatus.CONFLICT),
    PASSWORD_MISMATCH(2006, "Password and confirm password do not match", HttpStatus.BAD_REQUEST),
    CURRENT_PASSWORD_INCORRECT(2007, "Current password is incorrect", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_WEAK(2008, "Password does not meet security requirements", HttpStatus.BAD_REQUEST),
    USER_CANNOT_DELETE_SELF(2009, "Cannot delete your own account", HttpStatus.BAD_REQUEST),
    USER_HAS_ACTIVE_BOOKINGS(2010, "User has active bookings", HttpStatus.CONFLICT),
    EMAIL_NOT_FOUND(2011, "Email not found", HttpStatus.NOT_FOUND),
    CANNOT_CREATE_STUDENT_ACCOUNT(2012, "Cannot create student account through this endpoint",
            HttpStatus.BAD_REQUEST),

    // ==================== ENTITY: ROLE (2100-2199) ====================
    ROLE_NOT_FOUND(2100, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(2101, "Role already exists", HttpStatus.CONFLICT),
    ROLE_IN_USE(2102, "Role is being used by users", HttpStatus.CONFLICT),
    ROLE_CANNOT_DELETE_DEFAULT(2103, "Cannot delete default role", HttpStatus.BAD_REQUEST),

    // ==================== ENTITY: RESEARCH_GROUP (2200-2299) ====================
    RESEARCH_GROUP_NOT_FOUND(2200, "Research group not found", HttpStatus.NOT_FOUND),
    ALREADY_GROUP_MEMBER(2201, "User is already a member of this research group", HttpStatus.CONFLICT),
    PENDING_JOIN_REQUEST_EXISTS(2202, "User already has a pending join request for this research group",
            HttpStatus.CONFLICT),
    JOIN_REQUEST_NOT_FOUND(2203, "Join request not found", HttpStatus.NOT_FOUND),
    CANNOT_APPROVE_OWN_REQUEST(2204, "Cannot approve your own join request", HttpStatus.FORBIDDEN),
    NOT_GROUP_LEADER(2205, "Only group leader can perform this action", HttpStatus.FORBIDDEN),
    NOT_GROUP_CREATOR(2206, "Only group creator can perform this action", HttpStatus.FORBIDDEN),
    INVALID_REQUEST_STATUS(2207, "Invalid request status for this operation", HttpStatus.BAD_REQUEST),
    CANNOT_MODIFY_REQUEST(2208, "Cannot modify this join request", HttpStatus.FORBIDDEN),
    NOT_GROUP_MEMBER(2209, "User is not a member or creator of this research group", HttpStatus.FORBIDDEN),
    USER_ALREADY_MEMBER(2210, "User is already a member of this research group", HttpStatus.CONFLICT),
    NOT_GROUP_CREATOR_UPDATE(2211, "Only group creator can update this research group", HttpStatus.FORBIDDEN),
    RESEARCH_GROUP_PRIVATE(2212, "Private research group cannot be joined via request", HttpStatus.FORBIDDEN),
    NOT_LEADER_OR_CO_LEADER(2213, "Only LEADER or CO_LEADER of the group can perform this action", HttpStatus.FORBIDDEN),
    INSUFFICIENT_PERMISSION(2214, "You do not have sufficient permission for this action", HttpStatus.FORBIDDEN),
    NO_LEADER_IN_GROUP(2215, "Group must have at least one LEADER", HttpStatus.BAD_REQUEST),
    USER_NOT_MEMBER(2216, "User is not a member of this research group", HttpStatus.FORBIDDEN),
    CANNOT_CREATE_GROUP(2217, "Only ADMIN or LECTURER can create research groups", HttpStatus.FORBIDDEN),

    // ==================== ENTITY: FILE / DEVICE (2300-2399) ====================
    FILE_NOT_FOUND(2300, "File not found", HttpStatus.NOT_FOUND),
    ERROR_UPLOADING_FILE(2301, "Error uploading file", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE(2302, "Invalid file", HttpStatus.BAD_REQUEST),
    DEVICE_NAME_ALREADY_EXISTS(2303, "Device name already exists in this room", HttpStatus.CONFLICT),
    DEVICE_NOT_FOUND(2304, "Device not found", HttpStatus.NOT_FOUND),
    DEVICE_NOT_IN_LAB_ROOM(2305, "Device is not available in this lab room", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_DEVICE_QUANTITY(2306, "Insufficient device quantity available", HttpStatus.BAD_REQUEST),

    // ==================== ENTITY: LAB_ROOM (2400-2499) ====================
    LAB_ROOM_NOT_FOUND(2400, "Lab room not found", HttpStatus.NOT_FOUND),
    ROOM_NAME_ALREADY_EXISTS(2401, "Room name already exists", HttpStatus.CONFLICT),

    // ==================== ENTITY: SLOT (2500-2599) ====================
    SLOT_NOT_FOUND(2500, "Slot not found", HttpStatus.NOT_FOUND),
    SLOT_HAS_THESIS_BOOKING(2501, "Slot already has THESIS booking", HttpStatus.CONFLICT),

    // ==================== ENTITY: BOOKING (2600-2699) ====================
    BOOKING_NOT_FOUND(2600, "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_CONFLICT(2601, "Booking conflicts with existing booking", HttpStatus.CONFLICT),
    BOOKING_EXCEEDS_CAPACITY(2602, "Number of participants exceeds room capacity", HttpStatus.BAD_REQUEST),
    BOOKING_PAST_DATE(2603, "Cannot book for past dates", HttpStatus.BAD_REQUEST),
    BOOKING_NO_PARTICIPANTS(2604, "Booking must have at least one participant", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_CANCEL(2605, "Cannot cancel booking in current status", HttpStatus.FORBIDDEN),
    BOOKING_NOT_OWNER(2606, "Only booking creator can perform this action", HttpStatus.FORBIDDEN),
    THESIS_BOOKING_CONFLICT(2607, "Cannot book THESIS when slot has other bookings", HttpStatus.CONFLICT),
    BOOKING_NOT_ALLOWED(2608, "User is not allowed to view this booking", HttpStatus.FORBIDDEN),
    CREATOR_MUST_CANCEL_BOOKING(2609, "Creator must cancel the booking, not leave", HttpStatus.BAD_REQUEST),
    CANNOT_REMOVE_LAST_PARTICIPANT(2610, "Cannot remove the last participant", HttpStatus.BAD_REQUEST),
    PARTICIPANT_CANNOT_LEAVE_THESIS(2611, "Participants cannot leave THESIS booking", HttpStatus.FORBIDDEN),
    NOT_A_PARTICIPANT(2612, "User is not a participant of this booking", HttpStatus.FORBIDDEN),
    THESIS_BOOKING_NOT_ALLOWED(2613, "Only ADMIN or LECTURER can create THESIS booking", HttpStatus.FORBIDDEN),
    BOOKING_CANNOT_APPROVE(2614, "Cannot approve booking in current status", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_REJECT(2615, "Cannot reject booking in current status", HttpStatus.BAD_REQUEST),
    USER_ALREADY_BOOKED_IN_TIME_SLOT(2616, "User already has another booking in the selected time slot",
            HttpStatus.CONFLICT),
    SLOT_TIME_EXPIRED(2617, "Cannot book slot that has already ended", HttpStatus.BAD_REQUEST),
    BOOKING_TOO_FAR_IN_ADVANCE(2618, "Booking date exceeds maximum advance days for your role",
            HttpStatus.BAD_REQUEST),
    BOOKING_ROLE_NOT_ALLOWED(2619, "Your role is not allowed to create bookings", HttpStatus.FORBIDDEN),
    ONLY_THESIS_CAN_ADD_PARTICIPANTS(2620, "Only THESIS bookings can add participants", HttpStatus.BAD_REQUEST),
    PARTICIPANT_ALREADY_EXISTS(2621, "User is already a participant in this booking", HttpStatus.CONFLICT),
    BOOKING_CANNOT_UPDATE(2622, "Cannot update booking in current status", HttpStatus.BAD_REQUEST),
    BOOKING_UPDATE_WINDOW_EXPIRED(2623, "Booking update window has expired (must be 30 minutes before start)",
            HttpStatus.BAD_REQUEST),
    BOOKING_NO_SLOTS(2624, "Booking data is invalid: No assigned time slots found", HttpStatus.BAD_REQUEST),
    BOOKING_TIME_PASSED_CANNOT_APPROVE(2625, "Cannot approve booking as the scheduled time has already passed", HttpStatus.BAD_REQUEST),
    LATE_CANCELLATION_NOT_ALLOWED(2626, "Cannot cancel booking: Cancellation window has closed", HttpStatus.BAD_REQUEST),
    BOOKING_CREATION_TIME_INVALID(2627, "Invalid booking time: Booking window has closed", HttpStatus.BAD_REQUEST),
    BOOKING_VALIDATION_FAILED(2628, "Booking validation failed", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_BOOKING_TYPE(2629, "Unsupported booking type", HttpStatus.BAD_REQUEST),
    PERSONAL_BOOKING_DUPLICATED(2630, "User already has an active personal booking in the same date and slot", HttpStatus.CONFLICT),
    USER_CONFIRMED_IN_GROUP_BOOKING(2631, "User is already confirmed in a group booking in the same date and slot", HttpStatus.CONFLICT),
    GROUP_REQUIRES_ONE_RESEARCH_GROUP(2632, "MVP group booking must be linked to exactly one research group", HttpStatus.BAD_REQUEST),
    RESEARCH_GROUP_HAS_ACTIVE_BOOKING(2633, "Research group already has an active group booking in the same date and slot", HttpStatus.CONFLICT),
    ROOM_HAS_THESIS_BOOKING(2634, "Room already has an active thesis booking in the same date and slot", HttpStatus.CONFLICT),
    USER_HAS_PENDING_GROUP_INVITATION(2635, "User has a pending group invitation or conflict-resolution booking in the same date and slot", HttpStatus.OK),
    DUPLICATED_SLOT_IN_REQUEST(2636, "Booking request contains duplicated date and slot", HttpStatus.BAD_REQUEST),
    BOOKING_MULTIPLE_DATES_NOT_ALLOWED(2637, "Booking request can only contain slots in the same date", HttpStatus.BAD_REQUEST),

    // ==================== ENTITY: ATTENDANCE (2700-2799) ====================
    ATTENDANCE_NOT_FOUND(2700, "Attendance record not found", HttpStatus.NOT_FOUND),
    ALREADY_CHECKED_IN(2701, "Already checked in for this slot", HttpStatus.CONFLICT),
    ALREADY_CHECKED_OUT(2702, "Already checked out for this slot", HttpStatus.CONFLICT),
    NOT_CHECKED_IN_YET(2703, "Must check in before checking out", HttpStatus.BAD_REQUEST),
    TOO_EARLY_TO_CHECKIN(2704, "Too early to check in", HttpStatus.BAD_REQUEST),
    TOO_EARLY_TO_CHECKOUT(2709, "Cannot check out before slot ends", HttpStatus.BAD_REQUEST),
    TOO_FAR_FROM_LAB(2705, "You are too far from the lab room", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_APPROVED(2706, "Booking must be approved before attendance", HttpStatus.FORBIDDEN),
    SLOT_ALREADY_ENDED(2707, "Cannot check in after slot has ended", HttpStatus.BAD_REQUEST),
    NOTE_REQUIRED(2708, "Please enter a note (required when late / early checkout)", HttpStatus.BAD_REQUEST),
    ATTENDANCE_ACCESS_DENIED(2710, "You are not allowed to view this attendance data", HttpStatus.FORBIDDEN),

    // ==================== ENTITY: SYSTEM CONFIGURATION (2800-2899) ====================
    SYSTEM_CONFIG_NOT_FOUND(2800, "System configuration not found", HttpStatus.NOT_FOUND),
    SYSTEM_CONFIG_ALREADY_EXISTS(2801, "System configuration already exists", HttpStatus.CONFLICT),
    INVALID_SYSTEM_CONFIG_VALUE(2802, "Invalid system configuration value", HttpStatus.BAD_REQUEST),
    SYSTEM_CONFIG_UPDATE_FAILED(2803, "Failed to update system configuration", HttpStatus.INTERNAL_SERVER_ERROR),
    NO_CHANGES_DETECTED(2804, "No changes detected", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
