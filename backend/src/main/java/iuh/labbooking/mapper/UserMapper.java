package iuh.labbooking.mapper;

import iuh.labbooking.dto.request.user.CreateUserRequest;
import iuh.labbooking.dto.response.user.LecturerBriefInfoResponse;
import iuh.labbooking.dto.response.user.SecureUserResponse;
import iuh.labbooking.dto.response.user.UserBriefInfoResponse;
import iuh.labbooking.dto.response.user.UserSummaryResponse;
import iuh.labbooking.dto.response.user.UserResponse;
import iuh.labbooking.model.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {
        ResearchGroupMapper.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUser(CreateUserRequest request);

    @Mapping(source = "studentProfile.studentId", target = "studentId")
    @Mapping(source = "studentProfile.grade", target = "grade")
    @Mapping(source = "lecturerProfile.lecturerId", target = "lecturerId")
    @Mapping(source = "role.roleName", target = "role")
    UserResponse toResponse(User user);

    @Mapping(source = "role.roleName", target = "role")
    @Mapping(source = "studentProfile.studentId", target = "studentId")
    @Mapping(source = "studentProfile.grade", target = "grade")
    @Mapping(source = "lecturerProfile.lecturerId", target = "lecturerId")
    SecureUserResponse toSecureResponse(User user);

    @Mapping(source = "studentProfile.grade", target = "grade")
    UserBriefInfoResponse toBriefResponse(User user);

    @Mapping(source = "lecturerProfile.lecturerId", target = "lecturerId")
    LecturerBriefInfoResponse toLecturerBriefResponse(User user);

    @Mapping(target = "id", source = "userId")
    UserSummaryResponse toSummaryResponse(User user);
}
