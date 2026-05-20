package iuh.labbooking.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatasourceStartupLogger implements ApplicationRunner {

    private final Environment environment;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Runtime datasource URL: {}", environment.getProperty("spring.datasource.url"));
    }
}
