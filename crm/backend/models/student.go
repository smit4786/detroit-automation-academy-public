package models

import "time"

type Student struct {
	ID            string    `json:"id"`
	TenantID      string    `json:"tenant_id"` // Added for multi-tenancy
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	Email         string    `json:"email"`
	Cohort        string    `json:"cohort"`
	EnrollmentDate time.Time `json:"enrollment_date"`
	Status        string    `json:"status"` // e.g., "Active", "Completed", "Withdrawn"
}

type Tenant struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Subdomain   string    `json:"subdomain"`
	Plan        string    `json:"plan"` // "Educator", "Box", "Engine"
	CreatedAt   time.Time `json:"created_at"`
	Status      string    `json:"status"` // "Active", "Suspended"
}
