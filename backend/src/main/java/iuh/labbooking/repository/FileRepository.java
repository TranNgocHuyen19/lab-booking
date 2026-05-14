package iuh.labbooking.repository;

import iuh.labbooking.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File, Long> {

    List<File> findByFileNameStartingWithAndResourceType(String prefix, String resourceType);

    boolean existsByFileNameAndResourceTypeAndSize(String fileName, String resourceType, Long size);

    Optional<File> findByFileName(String fileName);
}
