package com.example.webapp_shop_ecommerce.controller;

import com.example.webapp_shop_ecommerce.dto.request.size.SizeRequest;
import com.example.webapp_shop_ecommerce.dto.response.ResponseObject;
import com.example.webapp_shop_ecommerce.dto.response.size.SizeResponse;
import com.example.webapp_shop_ecommerce.entity.Color;
import com.example.webapp_shop_ecommerce.entity.Size;
import com.example.webapp_shop_ecommerce.service.Impl.SizeServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/size")
public class SizeController {
    @Autowired
    private ModelMapper mapper;
    @Autowired
    private SizeServiceImpl SizeService;



    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(value = "page", defaultValue = "-1") Integer page,
            @RequestParam(value = "size", defaultValue = "-1") Integer size) {
        Pageable pageable = Pageable.unpaged();
        if (size < 0) {
            size = 5;
        }
        if (page >= 0) {
            pageable = PageRequest.of(page, size);
        }
        List<Size> sizes = SizeService.findAllDeletedFalse(pageable).getContent();
        List<SizeResponse> result = sizes.stream().map(attr -> mapper.map(attr, SizeResponse.class)).collect(Collectors.toList());
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findObjById(@PathVariable("id") Long id) {
        Optional<Size> otp = SizeService.findById(id);
        Boolean check = SizeService.existsById(id);
        System.out.println(check);

        if (otp.isEmpty()) {
            return new ResponseEntity<>(new ResponseObject("Fail", "Không tìm thấy id " + id, 1, null), HttpStatus.BAD_REQUEST);
        }
        SizeResponse brand = otp.map(pro -> mapper.map(pro, SizeResponse.class)).orElseThrow(IllegalArgumentException::new);
        return new ResponseEntity<>(brand, HttpStatus.OK);
    }
    @PostMapping()
    public ResponseEntity<ResponseObject> add(@RequestBody SizeRequest sizeRequest){

        Optional<Size> opt = SizeService.findByName(sizeRequest.getName());
        if (opt.isPresent()){
            return new ResponseEntity<>(new ResponseObject("Fail", "Tên thuộc tính đã tồn tại", 1, sizeRequest), HttpStatus.BAD_REQUEST);
        }
        Size size = mapper.map(sizeRequest, Size.class);
        return SizeService.createNew(size);

    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> update(@RequestBody SizeRequest sizeRequest, @PathVariable Long id){
        Optional<Size> opt = SizeService.findById(id);
        if (opt.isEmpty()){
            return new ResponseEntity<>(new ResponseObject("Fail", "Không Tìm Thấy ID", 1, sizeRequest), HttpStatus.BAD_REQUEST);
        }

        if (SizeService.findByName(sizeRequest.getName()).isPresent()){
            return new ResponseEntity<>(new ResponseObject("Fail", "Tên thuộc tính đã tồn tại", 1, sizeRequest), HttpStatus.BAD_REQUEST);
        }

        Size size = opt.get();
        size.setName(sizeRequest.getName());
        return SizeService.update(size);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> delete(@PathVariable Long id){
        return SizeService.delete(id);
    }


}
