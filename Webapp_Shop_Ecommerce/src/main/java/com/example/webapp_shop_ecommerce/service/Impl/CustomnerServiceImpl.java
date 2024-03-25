package com.example.webapp_shop_ecommerce.service.Impl;

import com.example.webapp_shop_ecommerce.entity.Customer;
import com.example.webapp_shop_ecommerce.infrastructure.security.Authentication;
import com.example.webapp_shop_ecommerce.repositories.ICustomerRepository;
import com.example.webapp_shop_ecommerce.service.ICustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomnerServiceImpl extends BaseServiceImpl<Customer, Long, ICustomerRepository> implements ICustomerService {


    @Override
    public List<Customer> findByNameAndPhone(String keyWord) {
        return repository.findByNameAndPhone(keyWord);
    }
}
