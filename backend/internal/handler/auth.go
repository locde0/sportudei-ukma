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

// Login godoc
// @Summary      User login
// @Description  Authenticates a user and sends an OTP if valid
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body dto.LoginRequest true "Login credentials"
// @Success      200 "OK"
// @Router       /api/auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	err := h.service.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// VerifyOTP godoc
// @Summary      Verify OTP
// @Description  Verifies the OTP and issues access and refresh tokens
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body dto.VerifyOTPRequest true "OTP data"
// @Success      200 {object} dto.TokenResponse
// @Router       /api/auth/verify [post]
func (h *AuthHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req dto.VerifyOTPRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
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

// Refresh godoc
// @Summary      Refresh token
// @Description  Refreshes the access token using a valid refresh token cookie
// @Tags         auth
// @Accept       json
// @Produce      json
// @Success      200 {object} dto.TokenResponse
// @Router       /api/auth/refresh [post]
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
