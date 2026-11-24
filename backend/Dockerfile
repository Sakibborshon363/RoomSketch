# Stage 1: Build application with Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Stage 2: Minimal Java 21 JRE runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S roomsketch && adduser -S roomsketch -G roomsketch
USER roomsketch

# Copy compiled jar from builder stage
COPY --from=builder /workspace/target/roomsketch-backend-*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
