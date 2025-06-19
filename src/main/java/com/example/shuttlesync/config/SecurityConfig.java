package com.example.shuttlesync.config;

import com.example.shuttlesync.config.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:8080"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Allow OPTIONS requests for CORS preflight
                        .requestMatchers(request -> "OPTIONS".equals(request.getMethod())).permitAll()
                        // Auth endpoints
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/auth/**")).permitAll()
                        // Momo payment endpoints
                        .requestMatchers(new AntPathRequestMatcher("/api/momo/callback")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/momo/return")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/payments/momo/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/payments/momo/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/payments/momo/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/admin/payments/momo/**")).permitAll()
                        // Public endpoints
                        .requestMatchers(new AntPathRequestMatcher("/api/public/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/test/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/test/**")).permitAll()
                        // Customer booking - specific public endpoints first (more specific rules first)
                        .requestMatchers(new AntPathRequestMatcher("/customer/courts")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/courts/*/timeslots")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/debug/auth")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/create-test")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/courts")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/courts/*/timeslots")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/debug/auth")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/create-test")).permitAll()
                        // Legacy booking endpoints (keep for backward compatibility)
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/courts")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/courts/*/timeslots")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/debug/auth")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/create-test")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/courts")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/courts/*/timeslots")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/debug/auth")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/create-test")).permitAll()
                        // Customer booking - protected endpoints (specific endpoints that need auth)
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/create")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/details/*")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/cancel/*")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/apply-voucher")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/customer/booking/vouchers")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/create")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/details/*")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/cancel/*")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/apply-voucher")).hasRole("CUSTOMER")
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/booking/vouchers")).hasRole("CUSTOMER")
                        // Customer invoice endpoints - TEMPORARY PUBLIC ACCESS FOR TESTING
                        .requestMatchers(new AntPathRequestMatcher("/customer/invoices/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/invoices/**")).permitAll()
                        // Customer booking history endpoints - TEMPORARY PUBLIC ACCESS FOR TESTING  
                        .requestMatchers(new AntPathRequestMatcher("/customer/bookings/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/bookings/**")).permitAll()
                        // Customer notifications endpoints - TEMPORARY PUBLIC ACCESS FOR TESTING
                        .requestMatchers(new AntPathRequestMatcher("/customer/notifications/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/notifications/**")).permitAll()
                        // Test endpoints
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/test")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/test-email/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/test-auto-gift/**")).permitAll()
                        // Admin endpoints
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/vouchers/**")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/**")).hasRole("ADMIN")
                        // Other customer endpoints - require authentication
                        .requestMatchers(new AntPathRequestMatcher("/api/customer/**")).hasRole("CUSTOMER")
                        // Booking endpoints
                        .requestMatchers(new AntPathRequestMatcher("/api/bookings/**")).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}