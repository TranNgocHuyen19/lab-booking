package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "front_student_card_media")
    private Long frontStudentCardMedia;

    @Column(name = "back_student_card_media")
    private Long backStudentCardMedia;

    @Column(name = "grade")
    private String grade;
}
