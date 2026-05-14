package iuh.labbooking.service.systemconfiguration;

import iuh.labbooking.dto.request.configuration.UpdateAttendanceSystemConfigRequest;
import iuh.labbooking.dto.request.configuration.UpdateBookingSystemConfigRequest;
import iuh.labbooking.dto.request.configuration.UpdateConfigFieldRequest;
import iuh.labbooking.dto.response.configuration.AttendanceSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.BookingSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.SystemConfigHistoryResponse;
import iuh.labbooking.model.AttendanceSystemConfig;
import iuh.labbooking.model.BookingSystemConfig;

import java.util.List;

public interface SystemConfigurationService {

    AttendanceSystemConfig getActiveAttendanceConfig();

    AttendanceSystemConfig createAttendanceSnapshot();

    AttendanceSystemConfigResponse updateAttendanceConfig(UpdateAttendanceSystemConfigRequest request);

    AttendanceSystemConfigResponse getAttendanceConfigResponse();
    
    AttendanceSystemConfigResponse updateAttendanceField(String key, UpdateConfigFieldRequest request);

    BookingSystemConfig getActiveBookingConfig();

    BookingSystemConfig createBookingSnapshot();

    BookingSystemConfigResponse updateBookingConfig(UpdateBookingSystemConfigRequest request);

    BookingSystemConfigResponse getBookingConfigResponse();

    BookingSystemConfigResponse updateBookingField(String key, UpdateConfigFieldRequest request);

    List<SystemConfigHistoryResponse> getAttendanceConfigHistory();

    List<SystemConfigHistoryResponse> getBookingConfigHistory();

    List<SystemConfigHistoryResponse> getAllConfigHistory();
}