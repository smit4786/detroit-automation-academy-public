package models

import "time"

type Student struct {
	ID             string    `json:"id"`
	TenantID       string    `json:"tenant_id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	AgeGrade       string    `json:"age_grade"`
	EducationLevel string    `json:"education_level"`
	ProgramInterest []string `json:"program_interest"`
	ExperienceLevel string    `json:"experience_level"`
	Language       string    `json:"language"`
	HearAboutUs    string    `json:"hear_about_us"`
	Goals          string    `json:"goals"`
	Comments       string    `json:"comments"`
	Cohort         string    `json:"cohort"`
	EnrollmentDate time.Time `json:"enrollment_date"`
	Status         string    `json:"status"` // e.g., "Active", "Completed", "Withdrawn", "Inquiry"
}

type Tenant struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Subdomain   string    `json:"subdomain"`
	Plan        string    `json:"plan"` // "Educator", "Box", "Engine"
	CreatedAt   time.Time `json:"created_at"`
	Status      string    `json:"status"` // "Active", "Suspended"
}
