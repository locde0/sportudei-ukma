package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type GameHandler struct {
	service *service.GameService
}

func NewGameHandler(s *service.GameService) *GameHandler {
	return &GameHandler{service: s}
}

func (h *GameHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	r.Get("/api/mohyla-games/{id}", h.GetGame)
	r.Get("/api/teams", h.ListTeams)

	r.Route("/api/admin/mohyla-games", func(r chi.Router) {
		r.Use(authMw)
		r.Put("/{id}", h.UpdateGame)
	})

	r.Route("/api/admin/teams", func(r chi.Router) {
		r.Use(authMw)
		r.Post("/", h.CreateTeam)
		r.Put("/{id}", h.UpdateTeam)
		r.Delete("/{id}", h.DeleteTeam)
	})
}

func (h *GameHandler) GetGame(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	game, err := h.service.GetGame(r.Context(), int32(id))
	if err != nil {
		http.Error(w, "failed to get game", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(game)
}

func (h *GameHandler) UpdateGame(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var dto service.MohylaGameDto
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateGame(r.Context(), int32(id), dto); err != nil {
		http.Error(w, "failed to update game", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *GameHandler) ListTeams(w http.ResponseWriter, r *http.Request) {
	teams, err := h.service.ListTeams(r.Context())
	if err != nil {
		http.Error(w, "failed to get teams", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

func (h *GameHandler) CreateTeam(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")
	description := r.FormValue("description")
	isActive := r.FormValue("is_active") == "true"

	file, fileHeader, err := r.FormFile("logo")
	if err != nil {
		http.Error(w, "logo is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	dto := service.TeamDto{
		Name:        name,
		Description: description,
		IsActive:    isActive,
	}

	id, err := h.service.CreateTeam(r.Context(), dto, fileHeader)
	if err != nil {
		http.Error(w, "failed to create team", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int32{"id": id})
}

func (h *GameHandler) UpdateTeam(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")
	description := r.FormValue("description")
	isActive := r.FormValue("is_active") == "true"

	dto := service.TeamDto{
		Name:        name,
		Description: description,
		IsActive:    isActive,
	}

	file, fileHeader, _ := r.FormFile("logo")
	if file != nil {
		defer file.Close()
	}

	if err := h.service.UpdateTeam(r.Context(), int32(id), dto, fileHeader); err != nil {
		http.Error(w, "failed to update team", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *GameHandler) DeleteTeam(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteTeam(r.Context(), int32(id)); err != nil {
		http.Error(w, "failed to delete team", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
