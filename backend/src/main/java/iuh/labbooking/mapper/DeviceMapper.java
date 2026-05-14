package iuh.labbooking.mapper;

import iuh.labbooking.dto.request.device.DeviceRequest;
import iuh.labbooking.dto.response.device.DeviceAvailabilityResponse;
import iuh.labbooking.dto.response.device.DeviceResponse;
import iuh.labbooking.dto.response.device.SecureDeviceResponse;
import iuh.labbooking.dto.response.device.RoomAllocationResponse;
import iuh.labbooking.model.Device;
import iuh.labbooking.model.LabRoomDevice;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DeviceMapper {

    @Mapping(target = "deviceId", ignore = true)
    @Mapping(target = "roomDevices", ignore = true)
    Device toEntity(DeviceRequest request);

    @Mapping(target = "deviceId", ignore = true)
    @Mapping(target = "roomDevices", ignore = true)
    void updateEntity(DeviceRequest request, @MappingTarget Device device);

    @Mapping(target = "totalQuantity", expression = "java(calculateTotalQuantity(device))")
    @Mapping(target = "roomAllocations", expression = "java(mapRoomAllocations(device))")
    SecureDeviceResponse toSecureResponse(Device device);

    default Integer calculateTotalQuantity(Device device) {
        if (device.getRoomDevices() == null) {
            return 0;
        }
        return device.getRoomDevices().stream()
                .mapToInt(LabRoomDevice::getQuantity)
                .sum();
    }

    default List<RoomAllocationResponse> mapRoomAllocations(Device device) {
        if (device.getRoomDevices() == null) {
            return java.util.Collections.emptyList();
        }
        return device.getRoomDevices().stream()
                .map(rd -> new RoomAllocationResponse(
                        rd.getLabRoom().getLabRoomId(),
                        rd.getLabRoom().getRoomName(),
                        rd.getQuantity()))
                .toList();
    }

    DeviceResponse toResponse(Device device);

    default DeviceAvailabilityResponse toAvailabilityResponse(
            LabRoomDevice labRoomDevice,
            int availableQuantity) {
        return DeviceAvailabilityResponse.builder()
                .deviceId(labRoomDevice.getDevice().getDeviceId())
                .deviceName(labRoomDevice.getDevice().getDeviceName())
                .deviceType(labRoomDevice.getDevice().getDeviceType())
                .icon(labRoomDevice.getDevice().getIcon())
                .totalQuantity(labRoomDevice.getQuantity())
                .availableQuantity(availableQuantity)
                .build();
    }
}
