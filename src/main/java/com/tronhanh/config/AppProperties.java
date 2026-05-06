package com.tronhanh.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Bind toàn bộ cấu hình có prefix "app" từ application.yml vào class này.
 * Sử dụng bằng cách inject @Autowired AppProperties hoặc constructor injection.
 *
 * Ví dụ trong application.yml:
 *   app:
 *     jwt:
 *       secret: xxx
 *       expiration: 86400000
 *     upload:
 *       dir: ./uploads
 *       url-prefix: http://localhost:8080/uploads
 */
@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /** Cấu hình JWT */
    private Jwt jwt = new Jwt();

    /** Cấu hình upload file */
    private Upload upload = new Upload();

    // ─────────────────────────────────────────
    //  Inner classes tương ứng với cấu trúc YAML
    // ─────────────────────────────────────────

    @Data
    public static class Jwt {
        /** Khóa bí mật dùng để ký và xác thực JWT (hex string) */
        private String secret;

        /** Thời gian sống của token tính bằng milliseconds (mặc định 24h) */
        private long expiration;
    }

    @Data
    public static class Upload {
        /** Đường dẫn thư mục gốc lưu file trên server */
        private String dir;

        /** URL prefix để client truy cập file đã upload */
        private String urlPrefix;
    }
}
