package models

import "time"

type Student struct {
	ID            string    `json:"id"`
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	Email         string    `json:"email"`
	Cohort        string    `json:"cohort"`
	EnrollmentDate time.Time `json:"enrollment_date"`
	Status        string    `json:"status"` // e.g., "Active", "Completed", "Withdrawn"
}
