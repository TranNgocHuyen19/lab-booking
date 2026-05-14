package iuh.labbooking.model;

import iuh.labbooking.enums.GroupType;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "research_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "research_group_id")
    private Long researchGroupId;

    @Column(name = "group_name", nullable = false, columnDefinition = "TEXT")
    private String groupName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "project_name", columnDefinition = "TEXT")
    private String projectName;

    @Enumerated(EnumType.STRING)
    @Column(name = "group_type")
    private GroupType groupType;

    // TODO: consider using Enum for status
    @Column(name = "status")
    private String status;

    @Column(name = "is_private")
    private boolean isPrivate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToMany(mappedBy = "researchGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GroupMembership> members;

    @OneToMany(mappedBy = "researchGroup", cascade = CascadeType.ALL)
    private Set<GroupJoinRequest> joinRequests;
}
