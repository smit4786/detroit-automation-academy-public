FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy Go module files
COPY go.mod ./

# Copy source code
COPY . .
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Use a minimal alpine image for the final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the pre-built binary file from the previous stage
COPY --from=builder /app/main .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
