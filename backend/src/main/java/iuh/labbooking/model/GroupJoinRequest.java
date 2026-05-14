package iuh.labbooking.model;

import iuh.labbooking.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_join_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupJoinRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long groupJoinRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "research_group_id")
    private ResearchGroup researchGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "response_note", columnDefinition = "TEXT")
    private String responseNote;

    @Column(name = "response_date", columnDefinition = "TEXT")
    private LocalDateTime responseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_by_id")
    private User responseBy;
}
