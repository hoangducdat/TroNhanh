package com.tronhanh.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Cấu hình Spring MVC:
 * - Map đường dẫn vật lý của thư mục uploads thành URL tĩnh
 *   để client có thể truy cập ảnh qua HTTP.
 *
 * Ví dụ:
 *   File lưu tại:  ./uploads/rooms/1/abc.jpg
 *   URL truy cập:  http://localhost:8080/uploads/rooms/1/abc.jpg
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private AppProperties appProperties;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Lấy đường dẫn thư mục upload từ cấu hình
        String uploadDir = appProperties.getUpload().getDir();

        // Chuyển sang đường dẫn tuyệt đối để tránh lỗi khi chạy từ các thư mục khác nhau
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();

        // Đăng ký resource handler:
        // Mọi request đến /uploads/** sẽ được map tới thư mục vật lý uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/");
    }
}
