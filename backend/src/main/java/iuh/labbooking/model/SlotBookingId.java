package iuh.labbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotBookingId implements Serializable {
    private Long bookingRequest;
    private Long slot;
}
