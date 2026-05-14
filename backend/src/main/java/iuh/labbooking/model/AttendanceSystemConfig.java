package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "attendance_system_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AttendanceSystemConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_system_config_id")
    private Long attendanceSystemConfigId;

    @Column(name = "early_checkin_minutes", nullable = false)
    private Integer earlyCheckinMinutes;

    @Column(name = "late_checkin_minutes", nullable = false)
    private Integer lateCheckinMinutes;

    @Column(name = "early_checkout_minutes", nullable = false)
    private Integer earlyCheckoutMinutes;

    @Column(name = "late_checkout_minutes", nullable = false)
    private Integer lateCheckoutMinutes;

    @Column(name = "lab_radius_meters", nullable = false)
    private Double labRadiusMeters;
}
