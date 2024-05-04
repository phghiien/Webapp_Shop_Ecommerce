package com.example.webapp_shop_ecommerce.dto.response.promotion;

import com.example.webapp_shop_ecommerce.dto.response.promotionDetails.PromotionDetailsResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class PromotionCountersResponse {
    private Long id;
    private String code;
    private String name;
    private Float value;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
}
