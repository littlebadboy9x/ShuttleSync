package com.example.shuttlesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.shuttlesync")
@EnableScheduling
public class ShuttleSyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShuttleSyncApplication.class, args);
	}

}
