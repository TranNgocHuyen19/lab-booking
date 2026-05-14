package iuh.labbooking.service.file;

import iuh.labbooking.dto.response.file.FileResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.FileMapper;
import iuh.labbooking.model.File;
import iuh.labbooking.repository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileServiceImpl implements FileService {

    FileRepository fileRepository;
    FileMapper fileMapper;

    @NonFinal
    @Value("${file.upload-dir:uploads}")
    String uploadDir;

    @NonFinal
    @Value("${file.public-base-url:http://localhost:8080/api/v1}")
    String publicBaseUrl;

    @Override
    public FileResponse storeFile(MultipartFile multipartFile, String entityFolder) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        try {
            String normalizedEntityFolder = entityFolder == null ? "" :
                    entityFolder.replace("_", "-").replace("\\", "/");
            if (normalizedEntityFolder.startsWith("/")) {
                normalizedEntityFolder = normalizedEntityFolder.substring(1);
            }

            Path rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path entityDir = rootDir.resolve(normalizedEntityFolder).normalize();
            Files.createDirectories(entityDir);

            String originalFilename = multipartFile.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                throw new AppException(ErrorCode.INVALID_FILE);
            }

            String safeFilename = originalFilename.replaceAll("[\\\\/]+", "_");
            Path filePath = entityDir.resolve(safeFilename).normalize();

            if (!filePath.startsWith(rootDir)) {
                throw new AppException(ErrorCode.INVALID_FILE);
            }

            Files.copy(multipartFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = normalizedEntityFolder.isBlank()
                    ? safeFilename
                    : normalizedEntityFolder + "/" + safeFilename;

            String ext = getExtension(safeFilename);
            String resourceType = determineResourceType(ext);

            File file = File.builder()
                    .fileName(relativePath)
                    .size(multipartFile.getSize())
                    .format(ext.startsWith(".") ? ext.substring(1).toLowerCase() : ext.toLowerCase())
                    .resourceType(resourceType)
                    .build();

            file = fileRepository.save(file);

            FileResponse base = fileMapper.toResponse(file);
            return FileResponse.builder()
                    .id(base.id())
                    .fileName(base.fileName())
                    .size(base.size())
                    .format(base.format())
                    .resourceType(base.resourceType())
                    .url(buildPublicUrl(relativePath))
                    .build();

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    @Override
    public java.util.List<FileResponse> storeMultipleFile(MultipartFile[] multipartFiles, String entityFolder) {
        if (multipartFiles == null) return java.util.List.of();
        return Arrays.stream(multipartFiles)
                .map(file -> storeFile(file, entityFolder))
                .toList();
    }

    @Override
    public FileResponse findById(Long id) {
        File file = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        FileResponse base = fileMapper.toResponse(file);
        return FileResponse.builder()
                .id(base.id())
                .fileName(base.fileName())
                .size(base.size())
                .format(base.format())
                .resourceType(base.resourceType())
                .url(buildPublicUrl(file.getFileName()))
                .build();
    }

    @Override
    public Page<FileResponse> findAll(Pageable pageable) {
        return fileRepository.findAll(pageable)
                .map(f -> {
                    FileResponse base = fileMapper.toResponse(f);
                    return FileResponse.builder()
                            .id(base.id())
                            .fileName(base.fileName())
                            .size(base.size())
                            .format(base.format())
                            .resourceType(base.resourceType())
                            .url(buildPublicUrl(f.getFileName()))
                            .build();
                });
    }

    @Override
    public void deleteFile(Long id) {
        File file = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        try {
            Path rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = rootDir.resolve(file.getFileName()).normalize();

            if (!filePath.startsWith(rootDir)) {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }

            Files.deleteIfExists(filePath);
            fileRepository.deleteById(file.getFileId());

        } catch (IOException e) {
            log.error("Failed to delete file: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    @Override
    public void deleteFileByUrl(String fileUrl) {
        String fileName = extractFileNameFromUrl(fileUrl);

        File file = fileRepository.findByFileName(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        try {
            Path rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = rootDir.resolve(file.getFileName()).normalize();

            if (!filePath.startsWith(rootDir)) {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }

            Files.deleteIfExists(filePath);
            fileRepository.deleteById(file.getFileId());

        } catch (IOException e) {
            log.error("Failed to delete file by URL: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    private String buildPublicUrl(String relativePath) {
        return publicBaseUrl + "/files/file/" + relativePath;
    }

    private String extractFileNameFromUrl(String fileUrl) {
        String prefix = "/files/file/";
        int index = fileUrl.indexOf(prefix);
        if (index == -1) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
        return fileUrl.substring(index + prefix.length());
    }

    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1 || lastDot == filename.length() - 1) return "";
        return filename.substring(lastDot).toLowerCase();
    }

    private String determineResourceType(String extWithDot) {
        String ext = extWithDot == null ? "" : extWithDot.toLowerCase();
        if (ext.matches("\\.(jpg|jpeg|png|gif|bmp|webp|svg)")) return "image";
        if (ext.matches("\\.(mp4|avi|mov|wmv|flv|webm|mkv)")) return "video";
        if (ext.matches("\\.(mp3|wav|ogg|aac|flac|m4a)")) return "audio";
        if (ext.matches("\\.(pdf|doc|docx|xls|xlsx|ppt|pptx)")) return "document";
        return "raw";
    }
}
