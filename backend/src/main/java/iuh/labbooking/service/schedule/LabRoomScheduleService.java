package iuh.labbooking.service.schedule;

import iuh.labbooking.dto.response.schedule.WeekScheduleResponse;

import java.time.LocalDate;

public interface LabRoomScheduleService {
    WeekScheduleResponse findWeekSchedule(LocalDate selectedDate);

    WeekScheduleResponse findWeekScheduleAdmin(LocalDate selectedDate);

}
