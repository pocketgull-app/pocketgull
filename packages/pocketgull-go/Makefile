.PHONY: build test test-race lint tidy clean sign

BIN_DIR := bin
BINARY := $(BIN_DIR)/pocketgull-server.exe
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown")
LDFLAGS := -s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.date=$(DATE)

build:
	@mkdir -p $(BIN_DIR)
	go build -ldflags "$(LDFLAGS)" -o $(BINARY) ./cmd/server

test:
	go test -v -cover ./...

test-race:
	go test -race -v -cover ./...

lint:
	golangci-lint run ./...

tidy:
	go mod tidy
	git diff --exit-code go.mod go.sum

clean:
	rm -rf $(BIN_DIR)
