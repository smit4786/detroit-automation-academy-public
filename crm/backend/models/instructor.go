package models

import "time"

type Instructor struct {
	ID        string    `json:"id" firestore:"-"`
	TenantID  string    `json:"tenant_id" firestore:"tenant_id"`
	FirstName string    `json:"first_name" firestore:"first_name"`
	LastName  string    `json:"last_name" firestore:"last_name"`
	Email     string    `json:"email" firestore:"email"`
	Status    string    `json:"status" firestore:"status"` // "Active", "Inactive"
	CreatedAt time.Time `json:"created_at" firestore:"created_at"`
}
