package com.roomsketch.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url:#{null}}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String springUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String springPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawUrl = (databaseUrl != null && !databaseUrl.isBlank()) ? databaseUrl : springDatasourceUrl;

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                // Convert postgres:// or postgresql:// to http URI for standard URI components parsing
                String normalized = rawUrl.replaceFirst("^postgres(ql)?://", "http://");
                URI uri = new URI(normalized);

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath(); // includes leading '/'
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                String user = springUsername;
                String pass = springPassword;

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    user = parts[0];
                    if (parts.length > 1) {
                        pass = parts[1];
                    }
                }

                config.setJdbcUrl(jdbcUrl);
                if (user != null) config.setUsername(user);
                if (pass != null) config.setPassword(pass);
                logger.info("Configured PostgreSQL DataSource for host: {} on port: {} and database: {}", host, port, path);
            } catch (Exception e) {
                logger.warn("Could not parse PostgreSQL URI ({}), falling back to direct URL: {}", e.getMessage(), rawUrl);
                config.setJdbcUrl(rawUrl);
                if (springUsername != null) config.setUsername(springUsername);
                if (springPassword != null) config.setPassword(springPassword);
            }
        } else {
            config.setJdbcUrl(rawUrl != null ? rawUrl : "jdbc:postgresql://localhost:5432/roomsketch_db");
            if (springUsername != null) config.setUsername(springUsername);
            if (springPassword != null) config.setPassword(springPassword);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(30000);

        return new HikariDataSource(config);
    }
}
