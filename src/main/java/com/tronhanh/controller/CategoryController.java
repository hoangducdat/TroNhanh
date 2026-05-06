package com.tronhanh.controller;

import com.tronhanh.dto.response.ApiResponse;
import com.tronhanh.dto.response.CategoryResponse;
import com.tronhanh.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller lấy danh sách danh mục phòng trọ.
 * Public — không cần đăng nhập (dùng để hiển thị bộ lọc tìm kiếm).
 */
@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    /**
     * GET /api/public/categories
     * Lấy toàn bộ danh mục — dùng cho dropdown bộ lọc tìm kiếm.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryRepository.findAll()
                .stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách danh mục thành công", categories));
    }
}
