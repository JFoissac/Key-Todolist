package com.todolist.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration pour gérer les problèmes CORS (Cross-Origin Resource Sharing)
 * Permet au frontend Angular (localhost:4200) d'accéder aux API du backend Spring Boot
 */
@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Autoriser localhost:4200
        config.addAllowedOrigin("http://localhost:4200");
        
        // Autoriser les en-têtes et méthodes
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Appliquer cette configuration à tous les chemins
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
