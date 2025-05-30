package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Discount;
import com.example.shuttlesync.service.impl.DiscountServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/discounts")
@CrossOrigin(origins = "http://localhost:3000")

public class DiscountsController {
    private final DiscountServiceImpl discountService;
    @Autowired
    public DiscountsController(DiscountServiceImpl discountService) {this.discountService = discountService;}

    @PostMapping
    public ResponseEntity<Discount> createDiscount(@RequestBody Discount discount) {
        Discount newDiscount = discountService.createDiscount(discount);
        return new ResponseEntity<>(newDiscount, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Discount>> getAllDiscounts() {
        List<Discount> discounts = discountService.getAllDiscounts();
        return ResponseEntity.ok(discounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Discount> getDiscountById(@PathVariable Integer id) {
        return  discountService.getDiscountById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Discount> updateDiscount(@PathVariable Integer id, @RequestBody Discount discount) {
        return discountService.getDiscountById(id).map(existingDiscount->{
            discount.setId(id);
            Discount updatedDiscount = discountService.createDiscount(discount);
            return ResponseEntity.ok(updatedDiscount);
        })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Discount> deleteDiscount(@PathVariable Integer id) {
        if (discountService.getDiscountById(id).isPresent()) {
            discountService.deleteDiscount(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<Discount> addDiscount(@PathVariable Integer id, @RequestBody Discount discount) {
       return discountService.getDiscountById(id).map(existingDiscount->{
          discount.setId(id);
          Discount addDiscount = discountService.createDiscount(discount);
          return ResponseEntity.ok(addDiscount);

       })
               .orElse(ResponseEntity.notFound().build());
    }





















}
