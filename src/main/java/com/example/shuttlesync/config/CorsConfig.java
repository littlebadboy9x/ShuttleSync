package com.example.shuttlesync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép tất cả các origin trong môi trường development
        config.addAllowedOrigin("http://localhost:3000");
        
        // Cho phép tất cả các header
        config.addAllowedHeader("*");
        
        // Expose các header cần thiết
        config.setExposedHeaders(List.of(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "Origin", 
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials", 
            "Access-Control-Allow-Headers", 
            "Access-Control-Allow-Methods"
        ));
        
        // Cho phép tất cả các method
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Cho phép gửi cookie
        config.setAllowCredentials(true);
        
        // Set max age
        config.setMaxAge(3600L);
        
        // Áp dụng cấu hình cho tất cả các endpoint
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 