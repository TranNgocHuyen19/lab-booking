package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "system_config_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SystemConfigHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "system_config_history_id")
    private Long systemConfigHistoryId;

    @Column(name = "config_key", nullable = false)
    private String configKey;

    @Column(name = "config_name")
    private String configName;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value", nullable = false)
    private String newValue;

    @Column(name = "reason")
    private String reason;

    @Column(name = "category")
    private String category;
}
