package httputil

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type Response struct {
	Success bool       `json:"success"`
	Data    any        `json:"data,omitempty"`
	Error   *ErrorInfo `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}

func JSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Data:    data,
	})
}

func Error(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Error: &ErrorInfo{
			Code:    code,
			Message: message,
		},
	})
}

func ErrorWithDetails(w http.ResponseWriter, status int, code, message string, details map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Error: &ErrorInfo{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

func HandleError(w http.ResponseWriter, err error) {
	if valErr, ok := errors.AsType[ValidationError](err); ok {
		ErrorWithDetails(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "invalid input data", valErr.Errors)
		return
	}

	switch {
	case errors.Is(err, domain.ErrNotFound):
		Error(w, http.StatusNotFound, "NOT_FOUND", err.Error())
	case errors.Is(err, domain.ErrAlreadyExists):
		Error(w, http.StatusConflict, "ALREADY_EXISTS", err.Error())
	case errors.Is(err, domain.ErrInvalidInput) || errors.Is(err, http.ErrMissingFile):
		Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
	case errors.Is(err, domain.ErrUnauthorized):
		Error(w, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
	case errors.Is(err, domain.ErrForbidden):
		Error(w, http.StatusForbidden, "FORBIDDEN", err.Error())
	default:
		Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
	}
}
