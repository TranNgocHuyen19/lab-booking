package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.researchgroup.MemberInfoResponse;
import iuh.labbooking.model.GroupMembership;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MemberInfoMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    MemberInfoResponse toMemberInfo(GroupMembership membership);

    List<MemberInfoResponse> toMemberInfoList(List<GroupMembership> memberships);

    Set<MemberInfoResponse> toMemberInfoSet(Set<GroupMembership> memberships);
}
