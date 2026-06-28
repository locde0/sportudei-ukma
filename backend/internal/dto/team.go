package dto

type BaseTeamRequest struct {
	Name         string `json:"name" validate:"required,min=1,max=255"`
	Description  string `json:"description" validate:"required,min=1"`
	IsActive     bool   `json:"is_active"`
	DisplayOrder int32  `json:"display_order" validate:"gte=0"`
}

type CreateTeamRequest struct {
	BaseTeamRequest
}

type UpdateTeamRequest struct {
	BaseTeamRequest
}

type UpdateTeamOrderRequest struct {
	DisplayOrder int32 `json:"display_order" validate:"gte=0"`
}

type BaseTeamResponse struct {
	ID           int32  `json:"id"`
	Name         string `json:"name"`
	LogoPath     string `json:"logo_path"`
	Description  string `json:"description"`
	DisplayOrder int32  `json:"display_order"`
}

type PublicTeamsListResponse struct {
	Teams []BaseTeamResponse `json:"teams"`
}

type AdminTeamResponse struct {
	BaseTeamResponse
	IsActive bool `json:"is_active"`
}

type AdminTeamsListResponse struct {
	Teams []AdminTeamResponse `json:"teams"`
}
