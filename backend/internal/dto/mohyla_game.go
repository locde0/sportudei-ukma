package dto

type UpdateMohylaGameRequest struct {
	Title       string `json:"title" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"required,min=1"`
	Content     string `json:"content" validate:"required,min=1"`
}

type MohylaGameResponse struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
}
