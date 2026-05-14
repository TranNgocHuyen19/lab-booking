package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.file.FileResponse;
import iuh.labbooking.model.File;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileMapper {

    @Mapping(target = "id", source = "fileId")
    @Mapping(target = "url", ignore = true)
    FileResponse toResponse(File file);
}
