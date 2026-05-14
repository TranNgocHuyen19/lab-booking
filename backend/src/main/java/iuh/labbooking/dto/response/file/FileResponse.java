package iuh.labbooking.dto.response.file;

import lombok.Builder;

@Builder
public record FileResponse(
        Long id,
        String fileName,
        Long size,
        String format,
        String resourceType,
        String url
) {}
