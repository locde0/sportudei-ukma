package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type AuthHandler struct {
	service    *service.AuthService
	refreshExp int
}

func NewAuthHandler(svc *service.AuthService, refreshExp int) *AuthHandler {
	return &AuthHandler{
		service:    svc,
		refreshExp: refreshExp,
	}
}

func (h *AuthHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/login", h.Login)
		r.Post("/verify", h.Verify)
		r.Post("/refresh", h.Refresh)
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request format", http.StatusBadRequest)
		return
	}

	err := h.service.LoginAndSendOTP(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "OTP code sent to email",
	})
}

func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request format", http.StatusBadRequest)
		return
	}

	accessToken, refreshToken, err := h.service.Verify(r.Context(), req.Email, req.Code)
	if err != nil {
		if errors.Is(err, service.ErrInvalidOTP) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	h.respondWithTokens(w, accessToken, refreshToken)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			http.Error(w, "refresh token is missing", http.StatusUnauthorized)
			return
		}
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	refreshToken := cookie.Value
	if refreshToken == "" {
		http.Error(w, "refresh token is empty", http.StatusUnauthorized)
		return
	}

	accessToken, newRefreshToken, err := h.service.RefreshToken(r.Context(), refreshToken)
	if err != nil {
		h.clearRefreshCookie(w)
		http.Error(w, "invalid or expired refresh token", http.StatusUnauthorized)
		return
	}

	h.respondWithTokens(w, accessToken, newRefreshToken)
}

func (h *AuthHandler) respondWithTokens(w http.ResponseWriter, accessToken, refreshToken string) {
	maxAge := h.refreshExp * 24 * 60 * 60

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   maxAge,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(TokenResponse{
		AccessToken: accessToken,
	})
}

func (h *AuthHandler) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   -1,
	})
}
