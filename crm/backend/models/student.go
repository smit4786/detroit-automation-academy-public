package models

import "time"

type Student struct {
	ID             string    `json:"id" firestore:"-"`
	TenantID       string    `json:"tenant_id" firestore:"tenant_id"`
	FirstName      string    `json:"first_name" firestore:"first_name"`
	LastName       string    `json:"last_name" firestore:"last_name"`
	Email          string    `json:"email" firestore:"email"`
	Phone          string    `json:"phone" firestore:"phone"`
	AgeGrade       string    `json:"age_grade" firestore:"age_grade"`
	EducationLevel string    `json:"education_level" firestore:"education_level"`
	ProgramInterest []string `json:"program_interest" firestore:"program_interest"`
	ExperienceLevel string    `json:"experience_level" firestore:"experience_level"`
	Language       string    `json:"language" firestore:"language"`
	HearAboutUs    string    `json:"hear_about_us" firestore:"hear_about_us"`
	Goals          string    `json:"goals" firestore:"goals"`
	Comments       string    `json:"comments" firestore:"comments"`
	Cohort         string    `json:"cohort" firestore:"cohort"`
	EnrollmentDate time.Time `json:"enrollment_date" firestore:"enrollment_date"`
	Status         string    `json:"status" firestore:"status"` // e.g., "Active", "Completed", "Withdrawn", "Inquiry"
	Attendance     []Session `json:"attendance" firestore:"attendance"`
}

type Session struct {
	Date    time.Time `json:"date" firestore:"date"`
	Present bool      `json:"present" firestore:"present"`
	Notes   string    `json:"notes" firestore:"notes"`
}

type Tenant struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Subdomain   string    `json:"subdomain"`
	Plan        string    `json:"plan"` // "Educator", "Box", "Engine"
	CreatedAt   time.Time `json:"created_at"`
	Status      string    `json:"status"` // "Active", "Suspended"
}
