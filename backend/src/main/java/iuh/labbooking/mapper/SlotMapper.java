package iuh.labbooking.mapper;

import iuh.labbooking.dto.request.slot.SlotRequest;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.slot.SecureSlotResponse;
import iuh.labbooking.model.Slot;
import iuh.labbooking.model.SlotBooking;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SlotMapper {

    @Mapping(target = "slotId", ignore = true)
    @Mapping(target = "active", defaultValue = "true")
    Slot toEntity(SlotRequest request);

    @Mapping(target = "slotId", ignore = true)
    void updateEntity(SlotRequest request, @MappingTarget Slot slot);

    @Mapping(target = "slotId", source = "slot.slotId")
    @Mapping(target = "slotName", source = "slot.slotName")
    @Mapping(target = "startTime", source = "slot.startTime")
    @Mapping(target = "endTime", source = "slot.endTime")
    @Mapping(target = "description", source = "slot.description")
    SlotResponse toSlotResponse(SlotBooking slotBooking);

    List<SlotResponse> toSlotResponseList(List<SlotBooking> slotBookings);

    SecureSlotResponse toResponse(Slot slot);

    SlotResponse toPublicResponse(Slot slot);
}
