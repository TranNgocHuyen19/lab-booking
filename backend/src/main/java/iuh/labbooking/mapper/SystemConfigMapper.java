package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.configuration.AttendanceSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.BookingSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.SystemConfigHistoryResponse;
import iuh.labbooking.model.AttendanceSystemConfig;
import iuh.labbooking.model.BookingSystemConfig;
import iuh.labbooking.model.SystemConfigHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SystemConfigMapper {

    AttendanceSystemConfigResponse toAttendanceConfigResponse(AttendanceSystemConfig config);

    BookingSystemConfigResponse toBookingConfigResponse(BookingSystemConfig config);

    @Mapping(source = "createdBy", target = "changedBy")
    @Mapping(source = "createdAt", target = "changedAt")
    SystemConfigHistoryResponse toConfigHistoryResponse(SystemConfigHistory history);
}
