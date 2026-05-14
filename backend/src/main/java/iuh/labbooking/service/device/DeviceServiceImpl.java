package iuh.labbooking.service.device;

import iuh.labbooking.dto.DeviceReservationDto;
import iuh.labbooking.dto.request.device.BulkDeviceStatusRequest;
import iuh.labbooking.dto.request.device.DeviceRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.device.DeviceAvailabilityResponse;
import iuh.labbooking.dto.response.device.DeviceResponse;
import iuh.labbooking.dto.response.device.SecureDeviceResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.DeviceMapper;
import iuh.labbooking.model.Device;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.LabRoomDevice;
import iuh.labbooking.repository.BookingDeviceRepository;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceMapper deviceMapper;
    private final LabRoomRepository labRoomRepository;
    private final SlotRepository slotRepository;
    private final BookingDeviceRepository bookingDeviceRepository;

    @Override
    @Transactional
    public SecureDeviceResponse createDevice(DeviceRequest request) {
        if (deviceRepository.existsByDeviceName(request.deviceName())) {
            throw new AppException(ErrorCode.DEVICE_NAME_ALREADY_EXISTS);
        }

        Device device = deviceMapper.toEntity(request);
        device.setActive(true);
        device = deviceRepository.save(device);
        return deviceMapper.toSecureResponse(device);
    }

    @Override
    @Transactional
    public SecureDeviceResponse updateDevice(Long id, DeviceRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));

        if (deviceRepository.existsByDeviceNameAndDeviceIdNot(request.deviceName(), id)) {
            throw new AppException(ErrorCode.DEVICE_NAME_ALREADY_EXISTS);
        }

        deviceMapper.updateEntity(request, device);
        
        if (request.active() != null) {
            device.setActive(request.active());
        }

        device = deviceRepository.save(device);
        return deviceMapper.toSecureResponse(device);
    }

    @Override
    @Transactional(readOnly = true)
    public SecureDeviceResponse findDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));
        return deviceMapper.toSecureResponse(device);
    }

    @Override
    public PageResponse<List<DeviceResponse>> findDevices(int page, int limit, String keyword) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Device> devices = deviceRepository.findDevicesByKeywordAndActiveTrue(keyword, pageable);
        return PageResponse.fromPage(devices, deviceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<SecureDeviceResponse>> findAllDevicesForAdmin(int page, int limit, String keyword, Boolean active) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Device> devices = deviceRepository.findDevicesByKeyword(keyword, active, pageable);
        return PageResponse.fromPage(devices, deviceMapper::toSecureResponse);
    }

    @Override
    @Transactional
    public void toggleDeviceStatus(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));
        device.setActive(!device.isActive());
        deviceRepository.save(device);
    }

    @Override
    @Transactional
    public void updateDevicesStatus(BulkDeviceStatusRequest request) {
        if (request.ids() == null || request.ids().isEmpty()) {
            return;
        }
        deviceRepository.updateActiveStatus(request.ids(), request.active());
    }


    @Override
    @Transactional(readOnly = true)
    public List<DeviceAvailabilityResponse> findDeviceAvailability(
            Long labRoomId,
            LocalDate date,
            List<Long> slotIds,
            Long excludeBookingId) {
        LabRoom labRoom = labRoomRepository.findById(labRoomId)
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        if (slotRepository.countBySlotIdIn(slotIds) != slotIds.size()) {
            throw new AppException(ErrorCode.SLOT_NOT_FOUND);
        }

        List<LabRoomDevice> labRoomDevices = labRoom.getLabRoomDevices();

        List<DeviceReservationDto> reservations = bookingDeviceRepository
                .findReservedQuantitiesByLabRoomAndDateAndSlots(
                        labRoomId, date, slotIds, excludeBookingId);

        Map<String, Long> reservationMap = reservations.stream()
                .collect(Collectors.toMap(
                        r -> r.deviceId() + "_" + r.slotId(),
                        DeviceReservationDto::reservedQuantity));

        return labRoomDevices.stream()
                .filter(lrd -> lrd.getDevice().isActive())
                .map(lrd -> {
                    int totalQty = lrd.getQuantity();

                    int minAvailable = slotIds.stream()
                            .mapToInt(slotId -> {
                                String key = lrd.getDevice().getDeviceId() + "_" + slotId;
                                long reserved = reservationMap.getOrDefault(key, 0L);
                                return totalQty - (int) reserved;
                            })
                            .min()
                            .orElse(totalQty);

                    return deviceMapper.toAvailabilityResponse(lrd, Math.max(minAvailable, 0));
                })
                .toList();
    }
}
