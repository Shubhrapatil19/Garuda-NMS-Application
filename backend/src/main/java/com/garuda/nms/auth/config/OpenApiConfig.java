package com.garuda.nms.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "BearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Garuda NMS - Authentication & Security APIs")
                        .version("1.0.0")
                        .description("Production-ready Enterprise Authentication Module for Garuda Network Management System"))
                // Relative URL "/" ensures Swagger always uses HTTPS on Ngrok
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server (Port 8080)"),
                        new Server().url("https://tinsmith-clamp-oversight.ngrok-free.dev").description("Remote Ngrok Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}