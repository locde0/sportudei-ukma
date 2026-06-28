package httputil

import (
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

type ValidationError struct {
	Errors map[string]string
}

func (e ValidationError) Error() string {
	return "validation failed"
}

func formatValidationErrors(err error) error {
	if valErrs, ok := errors.AsType[validator.ValidationErrors](err); ok {
		errsMap := make(map[string]string)
		for _, fErr := range valErrs {
			errsMap[fErr.Field()] = fErr.Tag()
		}
		return ValidationError{Errors: errsMap}
	}
	return err
}

func ParseJSON(r *http.Request, dst any) error {
	if r.Body == nil {
		return fmt.Errorf("%w: request body is empty", domain.ErrInvalidInput)
	}

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dst); err != nil {
		return fmt.Errorf("%w: invalid JSON: %v", domain.ErrInvalidInput, err)
	}

	if err := validate.Struct(dst); err != nil {
		return formatValidationErrors(err)
	}

	return nil
}

func ParseID(r *http.Request, param string) (int32, error) {
	raw := chi.URLParam(r, param)
	if raw == "" {
		return 0, fmt.Errorf("%w: missing URL parameter '%s'", domain.ErrInvalidInput, param)
	}

	id, err := strconv.ParseInt(raw, 10, 32)
	if err != nil {
		return 0, fmt.Errorf("%w: invalid '%s': must be a number", domain.ErrInvalidInput, param)
	}

	if id <= 0 {
		return 0, fmt.Errorf("%w: invalid '%s': must be positive", domain.ErrInvalidInput, param)
	}

	return int32(id), nil
}

func ParseMultipartJSON(r *http.Request, maxMemory int64, formKey string, dst any) error {
	if err := r.ParseMultipartForm(maxMemory); err != nil {
		return fmt.Errorf("%w: parse multipart form: %v", domain.ErrInvalidInput, err)
	}

	rawJSON := r.FormValue(formKey)
	if rawJSON == "" {
		return fmt.Errorf("%w: missing form field: %s", domain.ErrInvalidInput, formKey)
	}

	if err := json.Unmarshal([]byte(rawJSON), dst); err != nil {
		return fmt.Errorf("%w: invalid multipart JSON: %v", domain.ErrInvalidInput, err)
	}

	if err := validate.Struct(dst); err != nil {
		return formatValidationErrors(err)
	}

	return nil
}

func ParseFile(r *http.Request, key string) (multipart.File, *multipart.FileHeader, error) {
	file, header, err := r.FormFile(key)
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			return nil, nil, fmt.Errorf("%w: missing file field '%s'", domain.ErrInvalidInput, key)
		}
		return nil, nil, fmt.Errorf("%w: parse file: %v", domain.ErrInvalidInput, err)
	}
	return file, header, nil
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
