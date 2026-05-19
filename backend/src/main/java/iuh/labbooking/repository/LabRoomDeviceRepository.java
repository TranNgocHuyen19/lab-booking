package iuh.labbooking.repository;

import iuh.labbooking.model.LabRoomDevice;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabRoomDeviceRepository extends JpaRepository<LabRoomDevice, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({ @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000") })
    @Query("""
                SELECT lrd FROM LabRoomDevice lrd
                WHERE lrd.labRoom.labRoomId = :labRoomId
                AND lrd.device.deviceId IN :deviceIds
                ORDER BY lrd.device.deviceId ASC
            """)
    List<LabRoomDevice> findByLabRoomIdAndDeviceIdsWithLock(@Param("labRoomId") Long labRoomId,
            @Param("deviceIds") List<Long> deviceIds);

    boolean existsByLabRoom_LabRoomIdAndDevice_DeviceId(Long labRoomId, Long deviceId);

    Optional<LabRoomDevice> findByLabRoom_LabRoomIdAndDevice_DeviceId(Long labRoomId, Long deviceId);
}
