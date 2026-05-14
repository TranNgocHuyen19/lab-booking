package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.bookingdevice.BookingDeviceResponse;
import iuh.labbooking.model.BookingDevice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookingDeviceMapper {

    @Mapping(target = "deviceId", source = "device.deviceId")
    @Mapping(target = "deviceName", source = "device.deviceName")
    @Mapping(target = "deviceType", source = "device.deviceType")
    @Mapping(target = "icon", source = "device.icon")
    BookingDeviceResponse toDeviceResponse(BookingDevice bookingDevice);

    List<BookingDeviceResponse> toDeviceResponseList(Set<BookingDevice> devices);
}
