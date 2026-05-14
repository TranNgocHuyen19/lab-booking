package iuh.labbooking.dto.response.participant;

import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SecureParticipantResponse(
                Long participantId,
                Long userId,
                String username,
                String fullName,
                ParticipantRole role,
                ParticipantStatus status,
                LocalDateTime addedAt,
                String addedBy,
                LocalDateTime modifiedAt,
                String modifiedBy,
                LocalDateTime checkinAt,
                LocalDateTime checkoutAt,
                CheckinStatus checkinStatus,
                CheckoutStatus checkoutStatus,
                Integer lateCheckinMinutes,
                Integer earlyCheckoutMinutes,
                Integer lateCheckoutMinutes,
                String checkinNote,
                String checkoutNote) {
}
