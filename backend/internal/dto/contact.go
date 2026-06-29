package dto

type UpdateContactOrderRequest struct {
	DisplayOrder int32 `json:"displayOrder" validate:"gte=0"`
}

type BaseContactRequest struct {
	Platform string `json:"platform" validate:"required,oneof=telegram instagram facebook email tiktok whatsapp"`
	Name     string `json:"name" validate:"required,max=50"`
	URL      string `json:"url" validate:"required,url"`
}

type CreateContactRequest struct {
	BaseContactRequest
	DisplayOrder int32 `json:"displayOrder" validate:"gte=0"`
}

type UpdateContactRequest struct {
	BaseContactRequest
}

type ContactResponse struct {
	ID           int32  `json:"id"`
	Platform     string `json:"platform"`
	Name         string `json:"name"`
	URL          string `json:"url"`
	DisplayOrder int32  `json:"displayOrder"`
}

type ContactsListResponse struct {
	Contacts []ContactResponse `json:"contacts"`
}
