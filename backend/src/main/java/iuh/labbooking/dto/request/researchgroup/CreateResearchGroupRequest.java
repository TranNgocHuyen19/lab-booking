package iuh.labbooking.dto.request.researchgroup;

import iuh.labbooking.enums.GroupType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateResearchGroupRequest(
        @NotBlank(message = "Group name is required") @Size(max = 100, message = "Group name must not exceed 100 characters") String groupName,

        @Size(max = 500, message = "Description must not exceed 500 characters") String description,

        @Size(max = 200, message = "Project name must not exceed 200 characters") String projectName,

        @NotNull(message = "Group type is required") GroupType groupType,

        boolean isPrivate,

        Long advisorId,

        @Valid List<MemberInfoRequest> initialMembers) {
}
