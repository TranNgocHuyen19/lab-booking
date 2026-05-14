package iuh.labbooking.controller;

import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.file.FileResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.service.file.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "APIs for file upload, download, and management")
public class FileController {

    private final FileService fileService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload single file", description = "Upload a single file to the server")
    public ResponseEntity<ApiResponse<FileResponse>> uploadFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "entityFolder", defaultValue = "uploads") String entityFolder) {
        FileResponse response = fileService.storeFile(file, entityFolder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("File uploaded successfully", response));
    }

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple files", description = "Upload multiple files to the server")
    public ResponseEntity<ApiResponse<List<FileResponse>>> uploadMultipleFiles(
            @RequestPart("files") MultipartFile[] files,
            @RequestParam(value = "entityFolder", defaultValue = "uploads") String entityFolder) {
        List<FileResponse> responses = fileService.storeMultipleFile(files, entityFolder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Files uploaded successfully", responses));
    }

    @GetMapping("/metadata/{id}")
    @Operation(summary = "Get file metadata", description = "Get file metadata by file ID")
    public ResponseEntity<ApiResponse<FileResponse>> findFileById(@PathVariable Long id) {
        FileResponse response = fileService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("File metadata retrieved successfully", response));
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "List all files", description = "Get paginated list of all files")
    public ResponseEntity<ApiResponse<Page<FileResponse>>> findAllFiles(Pageable pageable) {
        Page<FileResponse> responses = fileService.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success("Files retrieved successfully", responses));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete file by ID", description = "Delete a file by its ID")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete file by URL", description = "Delete a file by its URL")
    public ResponseEntity<ApiResponse<Void>> deleteFileByUrl(@RequestParam("fileUrl") String fileUrl) {
        fileService.deleteFileByUrl(fileUrl);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }

    @GetMapping("/file/**")
    @Operation(summary = "Serve file", description = "Serve/download a file by its path")
    public ResponseEntity<Resource> readFile(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String prefix = "/files/file/";
        int idx = uri.indexOf(prefix);
        if (idx < 0)
            throw new AppException(ErrorCode.FILE_NOT_FOUND);

        String relativePath = uri.substring(idx + prefix.length());
        if (!StringUtils.hasText(relativePath))
            throw new AppException(ErrorCode.FILE_NOT_FOUND);

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = root.resolve(relativePath).normalize();
            if (!filePath.startsWith(root))
                throw new AppException(ErrorCode.FILE_NOT_FOUND);

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists())
                throw new AppException(ErrorCode.FILE_NOT_FOUND);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (MalformedURLException e) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }
}
