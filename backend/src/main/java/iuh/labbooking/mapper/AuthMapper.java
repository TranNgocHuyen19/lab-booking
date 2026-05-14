package iuh.labbooking.mapper;

import iuh.labbooking.dto.request.auth.RegisterRequest;
import iuh.labbooking.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AuthMapper {

    @Mapping(target = "passwordHash", ignore = true)
    User toEntity(RegisterRequest request);
}
