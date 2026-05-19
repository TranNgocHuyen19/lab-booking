package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class BookingStrategyFactory {

    private final Map<BookingType, BookingCreationStrategy> strategies = new EnumMap<>(BookingType.class);

    public BookingStrategyFactory(List<BookingCreationStrategy> strategies) {
        strategies.forEach(strategy -> this.strategies.put(strategy.bookingType(), strategy));
    }

    public BookingCreationStrategy getStrategy(BookingType bookingType) {
        BookingCreationStrategy strategy = strategies.get(bookingType);
        if (strategy == null) {
            throw new AppException(ErrorCode.UNSUPPORTED_BOOKING_TYPE, bookingType);
        }
        return strategy;
    }
}
