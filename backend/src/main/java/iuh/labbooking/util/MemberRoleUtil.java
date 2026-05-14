package iuh.labbooking.util;

import iuh.labbooking.enums.MemberRole;
import iuh.labbooking.repository.GroupMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class MemberRoleUtil {

    private final GroupMembershipRepository groupMembershipRepository;
    private final SecurityUtil securityUtil;

    public boolean hasRole(Long groupId, Long userId, MemberRole... requiredRoles) {
        if (securityUtil.isAdmin()) {
            return true;
        }

        return groupMembershipRepository
                .findByResearchGroup_ResearchGroupIdAndUser_UserId(groupId, userId)
                .map(membership -> Arrays.asList(requiredRoles).contains(membership.getRole()))
                .orElse(false);
    }
}
