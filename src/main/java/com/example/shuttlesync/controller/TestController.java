package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Invoice;
import com.example.shuttlesync.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    private final InvoiceService invoiceService;

    @GetMapping("/invoices")
    public ResponseEntity<?> getAllInvoices() {
        try {
            List<Invoice> invoices = invoiceService.getAllInvoices();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", invoices.size(),
                "invoices", invoices
            ));
        } catch (Exception e) {
            log.error("Error getting invoices", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceById(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "invoice", invoice
            ));
        } catch (Exception e) {
            log.error("Error getting invoice {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Backend is running"
        ));
    }
} 