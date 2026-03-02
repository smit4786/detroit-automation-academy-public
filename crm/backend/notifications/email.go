package notifications

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/smit4786/detroit-automation-academy-public/crm/backend/models"
)

var (
	PostmarkServerToken = os.Getenv("POSTMARK_SERVER_TOKEN")
	FromEmail           = os.Getenv("SENDER_EMAIL")
	AdminEmail          = os.Getenv("ADMIN_EMAIL")
)

type PostmarkEmail struct {
	From          string `json:"From"`
	To            string `json:"To"`
	Subject       string `json:"Subject"`
	Tag           string `json:"Tag"`
	HtmlBody      string `json:"HtmlBody"`
	TextBody      string `json:"TextBody"`
	MessageStream string `json:"MessageStream"`
}

func SendWelcomeEmail(s models.Student) {
	if PostmarkServerToken == "" || FromEmail == "" {
		log.Println("⚠️ Notifications skipped: Missing Postmark configuration.")
		return
	}

	body := fmt.Sprintf(`
		<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border: 1px solid #30363d; border-radius: 12px; overflow: hidden;">
			<div style="background: linear-gradient(135deg, #238636 0%%, #2ea043 100%%); padding: 32px 24px; text-align: center;">
				<h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">DETROIT AUTOMATION ACADEMY</h1>
			</div>
			<div style="padding: 32px 24px;">
				<h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">Welcome to the Future, %s!</h2>
				<p style="font-size: 16px; line-height: 1.6; color: #8b949e;">
					Your application for the <strong>%s</strong> cohort has been successfully received. We are thrilled to see your interest in <strong>%s</strong>.
				</p>
				<p style="font-size: 16px; line-height: 1.6; color: #8b949e;">
					At DAA, we aren't just teaching skills; we're building the infrastructure of Detroit's digital future. Our team will review your application and reach out within 24–48 hours to discuss the next steps in your automation journey.
				</p>
				<div style="margin: 32px 0; padding: 20px; background-color: #161b22; border-radius: 8px; border: 1px solid #30363d;">
					<h3 style="margin: 0 0 12px 0; font-size: 14px; color: #7d8590; text-transform: uppercase; letter-spacing: 0.05em;">Your Goals</h3>
					<p style="margin: 0; font-style: italic; color: #c9d1d9;">"%s"</p>
				</div>
				<p style="font-size: 14px; color: #8b949e; margin-top: 32px;">
					If you have any immediate questions, feel free to reply to this email or visit our <a href="https://detroitautomationacademy.com" style="color: #2ea043; text-decoration: none; font-weight: 600;">website</a>.
				</p>
			</div>
			<div style="background-color: #161b22; padding: 24px; text-align: center; border-top: 1px solid #30363d;">
				<p style="margin: 0; font-size: 12px; color: #484f58;">
					&copy; 2026 Detroit Automation Academy | The Youth STEM Lab @ Michigan Central
				</p>
			</div>
		</div>
	`, s.FirstName, s.Cohort, s.ProgramInterest, s.Goals)

	email := PostmarkEmail{
		From:     FromEmail,
		To:       s.Email,
		Subject:  "Welcome to Detroit Automation Academy!",
		HtmlBody: body,
		Tag:      "welcome-student",
	}

	send(email)
}

func SendAdminAlert(s models.Student) {
	if PostmarkServerToken == "" || AdminEmail == "" {
		return
	}

	interests := strings.Join(s.ProgramInterest, ", ")
	body := fmt.Sprintf(`
		<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f6f8fa; color: #24292f; border: 1px solid #d0d7de; border-radius: 12px; overflow: hidden;">
			<div style="background-color: #24292f; padding: 24px;">
				<h2 style="color: #ffffff; margin: 0; font-size: 18px;">New Enrollment Inquiry</h2>
			</div>
			<div style="padding: 24px;">
				<table style="width: 100%%; border-collapse: collapse; font-size: 14px;">
					<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #57606a;">NAME</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">%s %s</td></tr>
					<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #57606a;">EMAIL</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">%s</td></tr>
					<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #57606a;">PHONE</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">%s</td></tr>
					<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #57606a;">TENANT</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">%s</td></tr>
					<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #57606a;">PROGRAMS</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">%s</td></tr>
				</table>
				<div style="margin-top: 24px; padding: 16px; background-color: #ffffff; border: 1px solid #d0d7de; border-radius: 6px;">
					<h3 style="margin: 0 0 8px 0; font-size: 12px; color: #57606a; text-transform: uppercase;">Goals</h3>
					<p style="margin: 0; line-height: 1.5;">%s</p>
				</div>
				<div style="margin-top: 24px; text-align: center;">
					<a href="https://daa-crm-frontend-ww72p2xhtq-uc.a.run.app" style="display: inline-block; padding: 12px 24px; background-color: #2ea043; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Open Admin Dashboard</a>
				</div>
			</div>
		</div>
	`, s.FirstName, s.LastName, s.Email, s.Phone, s.TenantID, interests, s.Goals)

	email := PostmarkEmail{
		From:     FromEmail,
		To:       AdminEmail,
		Subject:  fmt.Sprintf("New Inquiry: %s %s", s.FirstName, s.LastName),
		HtmlBody: body,
		Tag:      "admin-alert",
	}

	send(email)
}

func send(email PostmarkEmail) {
	payload, _ := json.Marshal(email)
	req, _ := http.NewRequest("POST", "https://api.postmarkapp.com/email", bytes.NewBuffer(payload))
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Postmark-Server-Token", PostmarkServerToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Failed to send email via Postmark: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("❌ Postmark API error: status %d", resp.StatusCode)
	} else {
		log.Printf("✅ Notification sent to %s (Tag: %s)", email.To, email.Tag)
	}
}
