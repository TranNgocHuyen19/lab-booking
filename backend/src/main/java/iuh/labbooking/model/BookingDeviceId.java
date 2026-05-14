package iuh.labbooking.model;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingDeviceId implements Serializable {

    private Long bookingRequest;
    private Long device;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof BookingDeviceId))
            return false;
        BookingDeviceId that = (BookingDeviceId) o;
        return Objects.equals(bookingRequest, that.bookingRequest) &&
                Objects.equals(device, that.device);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingRequest, device);
    }
}
