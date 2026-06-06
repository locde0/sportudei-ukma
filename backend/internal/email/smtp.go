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

type SMTPMailer struct {
	host     string
	port     string
	username string
	password string
	tmpl     *template.Template
}

func NewSMTPMailer(host, port, username, password string) (*SMTPMailer, error) {
	tmpl, err := template.ParseFS(templateFS, "templates/*.html")
	if err != nil {
		return nil, fmt.Errorf("failed to parse email templates: %w", err)
	}

	return &SMTPMailer{
		host:     host,
		port:     port,
		username: username,
		password: password,
		tmpl:     tmpl,
	}, nil
}

func (m *SMTPMailer) SendOTP(toEmail, code string) error {
	auth := smtp.PlainAuth("", m.username, m.password, m.host)
	addr := fmt.Sprintf("%s:%s", m.host, m.port)

	data := struct {
		Code string
	}{Code: code}

	var body bytes.Buffer
	if err := m.tmpl.ExecuteTemplate(&body, "otp.html", data); err != nil {
		return fmt.Errorf("failed to execute otp template: %w", err)
	}

	subject := "Subject: Код доступу до адмінки\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	msg := append([]byte(subject+mime), body.Bytes()...)

	return smtp.SendMail(addr, auth, m.username, []string{toEmail}, msg)
}
