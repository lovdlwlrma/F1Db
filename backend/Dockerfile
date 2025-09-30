# Use the official Swagger UI image
FROM swaggerapi/swagger-ui:v5.17.14

# Copy the generated swagger.json file to the appropriate directory
COPY ./docs/swagger.json /usr/share/nginx/html/swagger.json

# Set environment variables to point to the swagger file
ENV SWAGGER_JSON_URL="swagger.json"
