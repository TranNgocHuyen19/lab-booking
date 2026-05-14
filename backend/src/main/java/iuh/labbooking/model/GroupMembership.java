package iuh.labbooking.model;

import iuh.labbooking.enums.MemberRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_memberships")
@IdClass(GroupMembershipId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMembership extends BaseEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "research_group_id")
    private ResearchGroup researchGroup;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private MemberRole role;
}
