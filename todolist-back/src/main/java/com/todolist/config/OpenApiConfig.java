package com.todolist.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration de l'API OpenAPI (Swagger)
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI todoListOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Serveur local");

        Contact contact = new Contact();
        contact.setEmail("contact@todolist.com");
        contact.setName("TodoList API Support");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("TodoList API")
                .version("1.0")
                .contact(contact)
                .description("API REST pour la gestion de tâches")
                .license(mitLicense);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer));
    }
}
