package iuh.labbooking.service.file;

import iuh.labbooking.dto.response.file.FileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {

    FileResponse storeFile(MultipartFile multipartFile, String entityFolder);

    List<FileResponse> storeMultipleFile(MultipartFile[] multipartFiles, String entityFolder);

    FileResponse findById(Long id);

    Page<FileResponse> findAll(Pageable pageable);

    void deleteFile(Long id);

    void deleteFileByUrl(String fileUrl);
}
