package iuh.labbooking.mapper;

import iuh.labbooking.dto.projection.GroupUsageDetailStat;
import iuh.labbooking.dto.response.dashboard.KpiWithGrowth;
import iuh.labbooking.dto.response.statistics.GroupStatInfo;
import iuh.labbooking.dto.response.statistics.GroupUsageDetailResponse;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface GroupStatisticsMapper {

    default KpiWithGrowth toKpiWithGrowth(double currentValue, double previousValue) {
        if (previousValue < 5 && previousValue != 0) {
            return new KpiWithGrowth(currentValue, null, currentValue >= previousValue);
        }

        if (previousValue == 0) {
            if (currentValue == 0) return new KpiWithGrowth(currentValue, 0.0, true);
            return new KpiWithGrowth(currentValue, 100.0, true);
        }

        double growth = Math.round((currentValue - previousValue) / previousValue * 100 * 10) / 10.0;
        return new KpiWithGrowth(currentValue, Math.abs(growth), growth >= 0);
    }

    default GroupUsageDetailResponse toGroupUsageDetailResponse(
            GroupUsageDetailStat stat,
            String mostUsedRoom,
            String mostUsedShift,
            double totalHours
    ) {
        if (stat == null) return null;
        
        return new GroupUsageDetailResponse(
                stat.groupId(),
                stat.groupName(),
                stat.groupType(),
                stat.creatorName(),
                mostUsedRoom != null ? mostUsedRoom : "-",
                mostUsedShift != null ? mostUsedShift : "-",
                totalHours,
                (int) stat.bookingCount()
        );
    }

    default GroupStatInfo toGroupStatInfo(GroupUsageDetailStat stat, double totalHours) {
        if (stat == null) return new GroupStatInfo("-", "-", 0.0, 0);
        return new GroupStatInfo(
                stat.groupName(),
                stat.groupType() != null ? stat.groupType().name() : "OTHER",
                totalHours,
                (int) stat.bookingCount()
        );
    }
}
