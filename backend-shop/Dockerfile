# Use the official Node.js 14 image
FROM node:14

# Create a new user and group with a non-root UID/GID
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set the working directory and change ownership to the new user
WORKDIR /app
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Copy application files
COPY ./app /app

# Install dependencies
RUN npm install

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["sh", "-c", "node app.js ${PLATFORM_ADDRESS} ${PLATFORM_PRIVATE_KEY}"]

# HEALTHCHECK instruction
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1