package iuh.labbooking.mapper;

import iuh.labbooking.dto.request.labroom.LabRoomRequest;
import iuh.labbooking.dto.response.labroom.LabRoomDeviceResponse;
import iuh.labbooking.dto.response.labroom.SecureLabRoomDeviceResponse;
import iuh.labbooking.dto.response.labroom.SecureLabRoomResponse;
import iuh.labbooking.dto.response.labroom.LabRoomResponse;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.LabRoomDevice;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        uses = {DeviceMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LabRoomMapper {

    @Mapping(target = "labRoomId", ignore = true)
    @Mapping(target = "labRoomDevices", ignore = true)
    LabRoom toEntity(LabRoomRequest request);

    @Mapping(target = "labRoomId", ignore = true)
    @Mapping(target = "labRoomDevices", ignore = true)
    void updateEntity(LabRoomRequest request, @MappingTarget LabRoom labRoom);

    @Mapping(source = "labRoomDevices", target = "devices")
    SecureLabRoomResponse toResponse(LabRoom labRoom);

    @Mapping(source = "labRoomDevices", target = "devices")
    LabRoomResponse toPublicResponse(LabRoom labRoom);

    @Mapping(source = "device", target = "device")
    SecureLabRoomDeviceResponse toSecureLabRoomDeviceResponse(LabRoomDevice labRoomDevice);

    @Mapping(source = "device", target = "device")
    LabRoomDeviceResponse toLabRoomDeviceResponse(LabRoomDevice labRoomDevice);
}
