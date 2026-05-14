package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "files")
public class File extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id", nullable = false, updatable = false)
    Long fileId;

    @Column(name = "file_name", nullable = false)
    String fileName;

    @Column(name = "size")
    Long size;

    @Column(name = "format")
    String format;

    @Column(name = "resource_type")
    String resourceType;
}
