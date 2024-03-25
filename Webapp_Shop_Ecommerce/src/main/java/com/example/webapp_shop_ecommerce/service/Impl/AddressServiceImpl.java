package com.example.webapp_shop_ecommerce.service.Impl;

import com.example.webapp_shop_ecommerce.dto.request.address.AddressRequest;
import com.example.webapp_shop_ecommerce.dto.request.products.ProductRequest;
import com.example.webapp_shop_ecommerce.dto.response.ResponseObject;
import com.example.webapp_shop_ecommerce.entity.Address;
import com.example.webapp_shop_ecommerce.entity.Customer;
import com.example.webapp_shop_ecommerce.infrastructure.security.Authentication;
import com.example.webapp_shop_ecommerce.repositories.IAddressRepository;
import com.example.webapp_shop_ecommerce.service.IAddressService;
import com.example.webapp_shop_ecommerce.service.ICustomerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AddressServiceImpl extends BaseServiceImpl<Address, Long, IAddressRepository> implements IAddressService {
    @Autowired
    private Authentication authentication;
    @Autowired
    private ICustomerService customerService;
    @Autowired
    private ModelMapper mapper;
    @Override
    public List<Address> findAddressByCustomerAndDeletedFalse() {
        return repository.findAddressByCustomerAndDeletedFalse(authentication.getCustomer());
    }

    @Override
    public ResponseEntity<ResponseObject> save(AddressRequest request) {
        Optional<Customer> opt = customerService.findById(request.getCustomer());
        if (opt.isEmpty()){
            return new ResponseEntity<>(new ResponseObject("error", "Không Thấy ID", 1, request), HttpStatus.BAD_REQUEST);
        }
        Customer customer = opt.get();
        Address address = mapper.map(request, Address.class);
        address.setDefaultAddress(false);
        address.setCustomer(customer);
        createNew(address);
        return new ResponseEntity<>(new ResponseObject("success", "Thêm Mới Thành Công", 0, request), HttpStatus.CREATED);

    }

    @Override
    public ResponseEntity<ResponseObject> update(AddressRequest request, Long id) {
        Optional<Customer> opt = customerService.findById(request.getCustomer());
        if (opt.isEmpty()){
            return new ResponseEntity<>(new ResponseObject("error", "Không Thấy ID Custommer", 1, request), HttpStatus.BAD_REQUEST);
        }
        Optional<Address> optionalAddress = findById(id);
        if (optionalAddress.isEmpty()){
            return new ResponseEntity<>(new ResponseObject("error", "Không Thấy ID Address", 1, request), HttpStatus.BAD_REQUEST);
        }
        Customer customer = opt.get();
        Address address = optionalAddress.get();
        address =   mapper.map(request, Address.class);
        address.setId(id);
        address.setCustomer(customer);
        update(address);
        return new ResponseEntity<>(new ResponseObject("success", "Cập Nhật Thành Công", 0, request), HttpStatus.CREATED);

    }
}
