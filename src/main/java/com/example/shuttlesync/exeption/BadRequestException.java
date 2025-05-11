package com.example.shuttlesync.exeption;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // sẽ trả mã lỗi HTTP 400
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}