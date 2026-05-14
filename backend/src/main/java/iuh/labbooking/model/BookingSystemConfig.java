package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "booking_system_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookingSystemConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_system_config_id")
    private Long bookingSystemConfigId;

    @Column(name = "student_advance_days", nullable = false)
    private Integer studentAdvanceDays;

    @Column(name = "lecturer_advance_days", nullable = false)
    private Integer lecturerAdvanceDays;

    @Column(name = "admin_advance_days", nullable = false)
    private Integer adminAdvanceDays;

    @Column(name = "min_minutes_before_start_to_cancel", nullable = false)
    private Integer minMinutesBeforeStartToCancel;

    @Column(name = "min_minutes_before_start_to_approve", nullable = false)
    private Integer minMinutesBeforeStartToApprove;

    @Column(name = "student_min_minutes_to_book", nullable = false)
    private Integer studentMinMinutesToBook;

    @Column(name = "lecturer_min_minutes_to_book", nullable = false)
    private Integer lecturerMinMinutesToBook;
}
