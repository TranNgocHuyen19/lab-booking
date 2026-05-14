package iuh.labbooking.service.device;

import iuh.labbooking.dto.request.device.BulkDeviceStatusRequest;
import iuh.labbooking.dto.request.device.DeviceRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.device.DeviceAvailabilityResponse;
import iuh.labbooking.dto.response.device.DeviceResponse;
import iuh.labbooking.dto.response.device.SecureDeviceResponse;

import java.time.LocalDate;
import java.util.List;

public interface DeviceService {
    SecureDeviceResponse createDevice(DeviceRequest request);

    SecureDeviceResponse updateDevice(Long id, DeviceRequest request);

    SecureDeviceResponse findDeviceById(Long id);

    PageResponse<List<DeviceResponse>> findDevices(int page, int limit, String keyword);

    PageResponse<List<SecureDeviceResponse>> findAllDevicesForAdmin(int page, int limit, String keyword, Boolean active);

    void toggleDeviceStatus(Long id);

    void updateDevicesStatus(BulkDeviceStatusRequest request);


    List<DeviceAvailabilityResponse> findDeviceAvailability(
            Long labRoomId,
            LocalDate date,
            List<Long> slotIds,
            Long excludeBookingId);
}
