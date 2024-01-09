package com.example.webapp_shop_ecommerce.dto.request.bill;

import com.example.webapp_shop_ecommerce.dto.request.customer.CustomerRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BillRequest {
    private Long id;
    private String codeBill;
    private String status;
    private Date bookingDate;
    private Date paymentDate;
    private Date DeliveryDate;
    private Date completionDate;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private Long customer;

//    private UserDto user;

}
