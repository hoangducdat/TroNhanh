package com.tronhanh.repository;

import com.tronhanh.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository tương tác với bảng `categories`.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
