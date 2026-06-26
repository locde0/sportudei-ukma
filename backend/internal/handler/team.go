package handler

import (
	"errors"
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type TeamHandler struct {
	service *service.TeamService
}

func NewTeamHandler(service *service.TeamService) *TeamHandler {
	return &TeamHandler{
		service: service,
	}
}

// CreateTeam godoc
// @Summary      Create team
// @Description  Create a new team with a logo
// @Tags         admin-teams
// @Accept       multipart/form-data
// @Produce      json
// @Param        payload formData string true "CreateTeamRequest JSON string"
// @Param        photo formData file true "Team logo photo"
// @Success      201 "Created"
// @Security     BearerAuth
// @Router       /api/admin/teams [post]
func (h *TeamHandler) CreateTeam(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTeamRequest
	if err := httputil.ParseMultipartJSON(r, 10<<20, "payload", &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	file, header, err := httputil.ParseFile(r, "photo")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}
	defer file.Close()

	domainFile := &domain.File{
		Name:        header.Filename,
		ContentType: header.Header["Content-Type"][0],
		Size:        header.Size,
		Content:     file,
	}

	team := &domain.Team{
		Name:         req.Name,
		Description:  req.Description,
		IsActive:     req.IsActive,
		DisplayOrder: req.DisplayOrder,
	}
	if err := h.service.CreateTeam(r.Context(), team, domainFile); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusCreated, nil)
}

// UpdateTeam godoc
// @Summary      Update team
// @Description  Update an existing team and its logo
// @Tags         admin-teams
// @Accept       multipart/form-data
// @Produce      json
// @Param        id path int true "Team ID"
// @Param        payload formData string true "UpdateTeamRequest JSON string"
// @Param        photo formData file false "Team logo photo (optional)"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/teams/{id} [put]
func (h *TeamHandler) UpdateTeam(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	var req dto.UpdateTeamRequest
	if err := httputil.ParseMultipartJSON(r, 10<<20, "payload", &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	var domainFile *domain.File
	file, header, err := httputil.ParseFile(r, "photo")
	if err != nil {
		if !errors.Is(err, http.ErrMissingFile) {
			httputil.HandleError(w, err)
			return
		}
	} else {
		defer file.Close()
		domainFile = &domain.File{
			Name:        header.Filename,
			ContentType: header.Header["Content-Type"][0],
			Size:        header.Size,
			Content:     file,
		}
	}

	team := &domain.Team{
		ID:           id,
		Name:         req.Name,
		Description:  req.Description,
		IsActive:     req.IsActive,
		DisplayOrder: req.DisplayOrder,
	}
	if err := h.service.UpdateTeam(r.Context(), team, domainFile); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// DeleteTeam godoc
// @Summary      Delete team
// @Description  Delete an existing team by ID
// @Tags         admin-teams
// @Produce      json
// @Param        id path int true "Team ID"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/teams/{id} [delete]
func (h *TeamHandler) DeleteTeam(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	if err := h.service.DeleteTeam(r.Context(), id); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// ListAdminTeams godoc
// @Summary      List admin teams
// @Description  List all teams for admin view
// @Tags         admin-teams
// @Produce      json
// @Success      200 {object} dto.AdminTeamsListResponse
// @Security     BearerAuth
// @Router       /api/admin/teams [get]
func (h *TeamHandler) ListAdminTeams(w http.ResponseWriter, r *http.Request) {
	teams, err := h.service.ListAdminTeams(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.AdminTeamResponse, 0, len(teams))
	for _, team := range teams {
		list = append(list, dto.AdminTeamResponse{
			BaseTeamResponse: dto.BaseTeamResponse{
				ID:           team.ID,
				Name:         team.Name,
				LogoPath:     team.LogoPath,
				Description:  team.Description,
				DisplayOrder: team.DisplayOrder,
			},
			IsActive: team.IsActive,
		})
	}

	httputil.JSON(w, http.StatusOK, &dto.AdminTeamsListResponse{Teams: list})
}

// ListPublicTeams godoc
// @Summary      List public teams
// @Description  List active teams for public view
// @Tags         public-teams
// @Produce      json
// @Success      200 {object} dto.PublicTeamsListResponse
// @Router       /api/teams [get]
func (h *TeamHandler) ListPublicTeams(w http.ResponseWriter, r *http.Request) {
	teams, err := h.service.ListPublicTeams(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.BaseTeamResponse, 0, len(teams))
	for _, team := range teams {
		list = append(list, dto.BaseTeamResponse{
			ID:           team.ID,
			Name:         team.Name,
			LogoPath:     team.LogoPath,
			Description:  team.Description,
			DisplayOrder: team.DisplayOrder,
		})
	}

	httputil.JSON(w, http.StatusOK, &dto.PublicTeamsListResponse{Teams: list})
}

// GetAdminTeam godoc
// @Summary      Get admin team
// @Description  Get full team details for admin by ID
// @Tags         admin-teams
// @Produce      json
// @Param        id path int true "Team ID"
// @Success      200 {object} dto.AdminTeamResponse
// @Security     BearerAuth
// @Router       /api/admin/teams/{id} [get]
func (h *TeamHandler) GetAdminTeam(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	team, err := h.service.GetAdminTeam(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := &dto.AdminTeamResponse{
		BaseTeamResponse: dto.BaseTeamResponse{
			ID:           team.ID,
			Name:         team.Name,
			LogoPath:     team.LogoPath,
			Description:  team.Description,
			DisplayOrder: team.DisplayOrder,
		},
		IsActive: team.IsActive,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// GetPublicTeam godoc
// @Summary      Get public team
// @Description  Get active team details for public by ID
// @Tags         public-teams
// @Produce      json
// @Param        id path int true "Team ID"
// @Success      200 {object} dto.BaseTeamResponse
// @Router       /api/teams/{id} [get]
func (h *TeamHandler) GetPublicTeam(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	team, err := h.service.GetPublicTeam(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := &dto.BaseTeamResponse{
		ID:           team.ID,
		Name:         team.Name,
		LogoPath:     team.LogoPath,
		Description:  team.Description,
		DisplayOrder: team.DisplayOrder,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// UpdateTeamOrder godoc
// @Summary      Update team order
// @Description  Update the display order of a team
// @Tags         admin-teams
// @Accept       json
// @Produce      json
// @Param        id path int true "Team ID"
// @Param        request body dto.UpdateTeamOrderRequest true "New order"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/teams/{id}/order [put]
func (h *TeamHandler) UpdateTeamOrder(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	var req dto.UpdateTeamOrderRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	team := &domain.Team{
		ID:           id,
		DisplayOrder: req.DisplayOrder,
	}
	if err := h.service.UpdateTeamOrder(r.Context(), team); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}
