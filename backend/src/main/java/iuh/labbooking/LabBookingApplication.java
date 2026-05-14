package iuh.labbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LabBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(LabBookingApplication.class, args);
	}

}
