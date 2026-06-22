package handler

import (
	"errors"
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type AuthHandler struct {
	service      *service.AuthService
	refreshExp   int
	secureCookie bool
}

func NewAuthHandler(s *service.AuthService, refreshExp int, secureCookie bool) *AuthHandler {
	return &AuthHandler{
		service:      s,
		refreshExp:   refreshExp,
		secureCookie: secureCookie,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "INVALID_JSON", err.Error())
		return
	}

	if errs := req.Validate(); len(errs) > 0 {
		httputil.Error(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request")
		return
	}

	err := h.service.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

func (h *AuthHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req dto.VerifyOTPRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "INVALID_JSON", err.Error())
	}

	if errs := req.Validate(); len(errs) > 0 {
		httputil.Error(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request")
	}

	accessToken, refreshToken, err := h.service.VerifyOTP(r.Context(), req.Email, req.Code)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	h.setRefreshCookie(w, refreshToken)
	httputil.JSON(w, http.StatusOK, dto.TokenResponse{
		AccessToken: accessToken,
	})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		httputil.Error(w, http.StatusUnauthorized, "MISSING_TOKEN", "refresh token is missing")
		return
	}

	if cookie.Value == "" {
		httputil.Error(w, http.StatusUnauthorized, "EMPTY_TOKEN", "refresh token is empty")
		return
	}

	accessToken, refreshToken, err := h.service.RefreshToken(r.Context(), cookie.Value)
	if err != nil {
		h.clearRefreshCookie(w)
		if errors.Is(err, domain.ErrUnauthorized) {
			httputil.Error(w, http.StatusUnauthorized, "INVALID_TOKEN", "invalid ro expired refresh token")
			return
		}
		httputil.HandleError(w, err)
		return
	}

	h.setRefreshCookie(w, refreshToken)
	httputil.JSON(w, http.StatusOK, dto.TokenResponse{
		AccessToken: accessToken,
	})
}

func (h *AuthHandler) setRefreshCookie(w http.ResponseWriter, refreshToken string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   h.secureCookie,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   h.refreshExp * 24 * 3600,
	})
}

func (h *AuthHandler) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   h.secureCookie,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   -1,
	})
}
