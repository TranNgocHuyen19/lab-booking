package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.participant.ParticipantResponse;
import iuh.labbooking.dto.response.participant.SecureParticipantResponse;
import iuh.labbooking.model.BookingParticipant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ParticipantMapper {

    @Mapping(target = "participantId", source = "bookingParticipantId")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    ParticipantResponse toResponse(BookingParticipant participant);

    @Mapping(target = "participantId", source = "bookingParticipantId")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "addedAt", source = "createdAt")
    @Mapping(target = "addedBy", source = "createdBy")
    SecureParticipantResponse toSecureResponse(BookingParticipant participant);

    List<ParticipantResponse> toResponseList(List<BookingParticipant> participants);

    List<SecureParticipantResponse> toSecureResponseList(List<BookingParticipant> participants);
}
