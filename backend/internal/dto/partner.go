package dto

type BasePartnerRequest struct {
	Name         string  `json:"name" validate:"required,min=1,max=255"`
	URL          *string `json:"url" validate:"omitempty,url"`
	IsActive     bool    `json:"is_active"`
	DisplayOrder int32   `json:"display_order" validate:"required,gt=0"`
}

type CreatePartnerRequest struct {
	BasePartnerRequest
}

type UpdatePartnerRequest struct {
	BasePartnerRequest
}

type UpdatePartnerOrderRequest struct {
	DisplayOrder int32 `json:"display_order" validate:"required,gt=0"`
}

type BasePartnerResponse struct {
	ID           int32   `json:"id"`
	Name         string  `json:"name"`
	LogoPath     string  `json:"logo_path"`
	URL          *string `json:"url"`
	DisplayOrder int32   `json:"display_order"`
}

type PublicPartnersListResponse struct {
	Partners []BasePartnerResponse `json:"partners"`
}

type AdminPartnerResponse struct {
	BasePartnerResponse
	IsActive bool `json:"is_active"`
}

type AdminPartnersListResponse struct {
	Partners []AdminPartnerResponse `json:"partners"`
}
