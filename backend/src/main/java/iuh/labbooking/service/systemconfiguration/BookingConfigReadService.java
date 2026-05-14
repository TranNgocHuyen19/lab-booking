package iuh.labbooking.service.systemconfiguration;

import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.BookingSystemConfig;
import iuh.labbooking.repository.BookingSystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingConfigReadService {

    private final BookingSystemConfigRepository bookingConfigRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "systemConfigs", key = "'booking'")
    public BookingSystemConfig getActiveBookingConfig() {
        log.debug("Cache MISS - Loading booking config from DB");
        return bookingConfigRepository.findActiveConfiguration()
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CONFIG_NOT_FOUND));
    }
}
