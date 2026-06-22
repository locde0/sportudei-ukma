package httputil

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func ParseJSON(r *http.Request, dst any) error {
	if r.Body == nil {
		return fmt.Errorf("request body is empty")
	}

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dst); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}

	return nil
}

func ParseID(r *http.Request, param string) (int32, error) {
	raw := chi.URLParam(r, param)
	if raw == "" {
		return 0, fmt.Errorf("missing URL parameter: %s", param)
	}

	id, err := strconv.ParseInt(raw, 10, 32)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: must be a number", param)
	}

	if id <= 0 {
		return 0, fmt.Errorf("invalid %s: must be positive", param)
	}

	return int32(id), nil
}

type Pagination struct {
	Limit  int32
	Offset int32
}

func ParsePagination(r *http.Request, defaultLimit int, defaultOffset int) Pagination {
	limit := parseQueryInt(r, "limit", defaultLimit)
	offset := parseQueryInt(r, "offset", defaultOffset)

	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return Pagination{
		Limit:  int32(limit),
		Offset: int32(offset),
	}
}

func parseQueryInt(r *http.Request, key string, defaultVal int) int {
	raw := r.URL.Query().Get(key)
	if raw == "" {
		return defaultVal
	}

	val, err := strconv.Atoi(raw)
	if err != nil {
		return defaultVal
	}

	return val
}
