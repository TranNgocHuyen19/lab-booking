package iuh.labbooking.repository;

import iuh.labbooking.model.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceName(String deviceName);

    boolean existsByDeviceName(String deviceName);

    boolean existsByDeviceNameAndDeviceIdNot(String deviceName, Long deviceId);

    @Query("SELECT d FROM Device d WHERE d.active = true AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(d.deviceName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY d.deviceName ASC")
    Page<Device> findDevicesByKeywordAndActiveTrue(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT d FROM Device d WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(d.deviceName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:active IS NULL OR d.active = :active) " +
            "ORDER BY d.deviceName ASC")
    Page<Device> findDevicesByKeyword(@Param("keyword") String keyword, @Param("active") Boolean active, Pageable pageable);

    @Modifying
    @Query("UPDATE Device d SET d.active = :active WHERE d.deviceId IN :ids")
    void updateActiveStatus(List<Long> ids, boolean active);

}
