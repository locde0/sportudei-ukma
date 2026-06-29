FROM golang:1.26-alpine AS builder

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/api ./cmd/api

FROM alpine:3.22

RUN apk add --no-cache ca-certificates tzdata

RUN adduser -D -g '' appuser

WORKDIR /app

RUN mkdir -p /app/uploads/events /app/uploads/albums /app/uploads/partners /app/uploads/teams \
    && chown -R appuser:appuser /app

COPY --from=builder /app/api /app/api

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/app/api"]