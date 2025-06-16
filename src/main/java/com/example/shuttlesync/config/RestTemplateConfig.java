package com.example.shuttlesync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30 seconds connection timeout
        factory.setReadTimeout(30000);    // 30 seconds read timeout
        
        RestTemplate restTemplate = new RestTemplate(factory);
        return restTemplate;
    }
} 