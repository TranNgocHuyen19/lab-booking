package iuh.labbooking.configuration.openapi;

/*
 * @description: OpenApiConfiguration
 * @author: Trần Ngọc Huyền
 * @date: 12/19/2025
 * @version: 1.0
 */

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    public static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info().title("Lab Booking API")
                        .description("API documentation for the Lab Booking application")
                        .version("1.0.0")
                        .termsOfService("https://www.example.com/terms")
                        .contact(new io.swagger.v3.oas.models.info.Contact()
                                .name("HH Team")
                                .email("22655541.huyen@student.iuh.edu")))

                .components(new Components().addSecuritySchemes(
                        SECURITY_SCHEME_NAME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("Bearer")
                                .bearerFormat("JWT")
                ))

                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}
