package com.example.shuttlesync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // Allow all origins for development
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép tất cả các origin trong môi trường development
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:8080"
        ));
        
        // Cho phép tất cả các header
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose các header cần thiết
        config.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "Origin", 
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials", 
            "Access-Control-Allow-Headers", 
            "Access-Control-Allow-Methods",
            "X-Requested-With"
        ));
        
        // Cho phép tất cả các method
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        
        // Cho phép gửi cookie
        config.setAllowCredentials(true);
        
        // Set max age
        config.setMaxAge(3600L);
        
        // Áp dụng cấu hình cho tất cả các endpoint
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 