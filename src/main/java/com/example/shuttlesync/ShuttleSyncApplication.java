package com.example.shuttlesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.shuttlesync")
public class ShuttleSyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShuttleSyncApplication.class, args);
	}

}
