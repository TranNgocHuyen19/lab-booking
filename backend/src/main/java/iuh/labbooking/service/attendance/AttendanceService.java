package iuh.labbooking.service.attendance;

import iuh.labbooking.dto.request.attendance.CheckInRequest;
import iuh.labbooking.dto.request.attendance.CheckOutRequest;
import iuh.labbooking.dto.response.attendance.AttendanceResponse;
import iuh.labbooking.dto.response.attendance.AttendanceStatusResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AttendanceService {
    
    AttendanceResponse checkIn(Long bookingId, CheckInRequest request);
    
    AttendanceResponse checkOut(Long bookingId, CheckOutRequest request);

    AttendanceStatusResponse findAttendanceStatusByBookingId(Long bookingId);

    List<AttendanceResponse> findAttendancesByBookingId(Long bookingId);
}
