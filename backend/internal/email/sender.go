package email

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"

	"github.com/resend/resend-go/v2"
)

//go:embed templates/*.html
var templateFS embed.FS

type EmailSender interface {
	SendOTPCode(email, code string) error
}

type ResendSender struct {
	client *resend.Client
	from   string
	tmpl   *template.Template
}

func NewResendSender(apiKey, from string) (*ResendSender, error) {
	tmpl, err := template.ParseFS(templateFS, "templates/*.html")
	if err != nil {
		return nil, fmt.Errorf("parse email templates: %w", err)
	}
	
	client := resend.NewClient(apiKey)
	
	return &ResendSender{
		client: client,
		from:   from,
		tmpl:   tmpl,
	}, nil
}

func (s *ResendSender) SendOTPCode(email, code string) error {
	var body bytes.Buffer
	if err := s.tmpl.ExecuteTemplate(&body, "otp.html", struct{ Code string }{Code: code}); err != nil {
		return fmt.Errorf("execute otp template: %w", err)
	}

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{email},
		Subject: "Код доступу до адмінки",
		Html:    body.String(),
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("send resend email: %w", err)
	}

	return nil
}
