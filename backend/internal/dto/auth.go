package dto

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r LoginRequest) Validate() map[string]string {
	errs := make(map[string]string)
	if r.Email == "" {
		errs["email"] = "required"
	}
	if r.Password == "" {
		errs["password"] = "required"
	}
	return errs
}

type VerifyOTPRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func (r VerifyOTPRequest) Validate() map[string]string {
	errs := make(map[string]string)
	if r.Email == "" {
		errs["email"] = "required"
	}
	if r.Code == "" {
		errs["code"] = "required"
	}
	return errs
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
}
