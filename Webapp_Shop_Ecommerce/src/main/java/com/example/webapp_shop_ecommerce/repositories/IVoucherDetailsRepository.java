package com.example.webapp_shop_ecommerce.repositories;

import com.example.webapp_shop_ecommerce.entity.Promotion;
import com.example.webapp_shop_ecommerce.entity.Voucher;
import com.example.webapp_shop_ecommerce.entity.VoucherDetails;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface IVoucherDetailsRepository extends IBaseReporitory<VoucherDetails, Long> {
    @Transactional
    @Modifying
    @Query("update VoucherDetails vd set vd.deleted = true where vd.voucher = :voucher")
    void deleteByVoucherTyleUpdate(@Param("voucher") Voucher voucher);


    @Query("select vd from VoucherDetails vd where vd.bill.id = :idBill")
    List<VoucherDetails> findByIdBill(@Param("idBill") Long idBill);
}
