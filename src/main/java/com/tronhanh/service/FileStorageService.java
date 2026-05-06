package com.tronhanh.service;

import com.tronhanh.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service xử lý lưu trữ file ảnh upload lên server.
 *
 * Cấu trúc thư mục lưu:
 *   {upload.dir}/rooms/{roomId}/{uuid}.{extension}
 *
 * URL truy cập:
 *   {upload.url-prefix}/rooms/{roomId}/{uuid}.{extension}
 */
@Slf4j
@Service
public class FileStorageService {

    @Autowired
    private AppProperties appProperties;

    /**
     * Lưu một file ảnh vào thư mục của phòng và trả về URL đầy đủ.
     *
     * @param file   file ảnh từ multipart request
     * @param roomId ID phòng — dùng để tạo thư mục con riêng
     * @return URL đầy đủ để client truy cập ảnh (lưu vào bảng room_images)
     * @throws RuntimeException nếu lưu file thất bại
     */
    public String storeRoomImage(MultipartFile file, Long roomId) {
        // Lấy extension gốc của file (jpg, png, webp, ...)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);

        // Tạo tên file duy nhất bằng UUID để tránh trùng lặp
        String newFilename = UUID.randomUUID() + "." + extension;

        // Đường dẫn thư mục: {uploadDir}/rooms/{roomId}/
        Path uploadDir = Paths.get(appProperties.getUpload().getDir())
                .resolve("rooms")
                .resolve(roomId.toString())
                .toAbsolutePath();

        try {
            // Tạo thư mục nếu chưa tồn tại (kể cả thư mục cha)
            Files.createDirectories(uploadDir);

            // Đường dẫn đầy đủ của file cần lưu
            Path targetPath = uploadDir.resolve(newFilename);

            // Sao chép nội dung file vào đường dẫn đích
            // REPLACE_EXISTING: ghi đè nếu file cùng tên đã tồn tại (UUID nên rất hiếm)
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Đã lưu ảnh: {}", targetPath);

        } catch (IOException e) {
            log.error("Lỗi khi lưu file ảnh cho phòng {}: {}", roomId, e.getMessage());
            throw new RuntimeException("Không thể lưu file ảnh. Vui lòng thử lại", e);
        }

        // Ghép URL đầy đủ để trả về và lưu vào DB
        // Ví dụ: http://localhost:8080/uploads/rooms/1/abc.jpg
        return appProperties.getUpload().getUrlPrefix()
                + "/rooms/" + roomId + "/" + newFilename;
    }

    /**
     * Lấy phần mở rộng (extension) của file.
     * Nếu không có extension hoặc filename null → mặc định là "jpg".
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        // Lấy phần sau dấu chấm cuối cùng, chuyển về lowercase
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
