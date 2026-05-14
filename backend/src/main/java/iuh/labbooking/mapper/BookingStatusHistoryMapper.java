package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.bookinghistory.BookingStatusHistoryResponse;
import iuh.labbooking.model.BookingRequestStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookingStatusHistoryMapper {

    @Mapping(target = "createdBy", ignore = true)
    BookingStatusHistoryResponse toResponse(BookingRequestStatusHistory history);

    default List<BookingStatusHistoryResponse> toResponseList(List<BookingRequestStatusHistory> histories) {
        if (histories == null) return List.of();
        return histories.stream().map(this::toResponse).toList();
    }
}
