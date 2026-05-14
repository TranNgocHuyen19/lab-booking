package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.attendance.AttendanceResponse;
import iuh.labbooking.model.BookingSlotAttendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AttendanceMapper {

    @Mapping(target = "attendanceId", source = "bookingSlotAttendanceId")
    @Mapping(target = "userName", source = "bookingParticipant.user.username")
    @Mapping(target = "userFullName", source = "bookingParticipant.user.fullName")
    AttendanceResponse toResponse(BookingSlotAttendance attendance);
}
