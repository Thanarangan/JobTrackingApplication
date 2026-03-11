# ---------- build stage ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests clean package

# ---------- run stage ----------
FROM eclipse-temurin:21-jre

# create directory first
RUN mkdir /app

WORKDIR /app

ENV PORT=8080

# create user
RUN useradd -m spring

# copy jar
COPY --from=build /app/target/*.jar /app/app.jar

# change ownership
RUN chown -R spring:spring /app

USER spring

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]