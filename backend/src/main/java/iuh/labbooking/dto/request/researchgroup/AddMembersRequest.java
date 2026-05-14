package iuh.labbooking.dto.request.researchgroup;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AddMembersRequest(
        @NotEmpty(message = "Members are required") @Valid List<MemberInfoRequest> members) {
}
