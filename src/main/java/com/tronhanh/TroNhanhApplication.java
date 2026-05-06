package com.tronhanh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Điểm khởi động chính của ứng dụng TroNhanh Backend.
 * Spring Boot sẽ tự động quét toàn bộ package con của com.tronhanh.
 */
@SpringBootApplication
public class TroNhanhApplication {

    public static void main(String[] args) {
        SpringApplication.run(TroNhanhApplication.class, args);
    }
}
