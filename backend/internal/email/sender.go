package email

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"net/smtp"
)

//go:embed templates/*.html
var templateFS embed.FS

type EmailSender interface {
	SendOTPCode(email, code string) error
}

type SMTPSender struct {
	host     string
	port     string
	username string
	password string
	from     string
	tmpl     *template.Template
}

func NewSMTPSender(host, port, username, password, from string) (*SMTPSender, error) {
	tmpl, err := template.ParseFS(templateFS, "templates/*.html")
	if err != nil {
		return nil, fmt.Errorf("parse email templates: %w", err)
	}
	return &SMTPSender{
		host:     host,
		port:     port,
		username: username,
		password: password,
		from:     from,
		tmpl:     tmpl,
	}, nil
}

func (s *SMTPSender) SendOTPCode(email, code string) error {
	var body bytes.Buffer
	if err := s.tmpl.ExecuteTemplate(&body, "otp.html", struct{ Code string }{Code: code}); err != nil {
		return fmt.Errorf("execute otp template: %w", err)
	}

	msg := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: Код доступу до адмінки\r\n"+
			"MIME-version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		s.from, email, body.String(),
	)

	auth := smtp.PlainAuth("", s.username, s.password, s.host)
	addr := fmt.Sprintf("%s:%s", s.host, s.port)

	return smtp.SendMail(addr, auth, s.from, []string{email}, []byte(msg))
}
