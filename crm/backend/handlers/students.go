package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/smit4786/detroit-automation-academy-public/crm/backend/models"
)

// Mock data for initial development with multi-tenancy
var mockStudents = []models.Student{
	{
		ID:             "1",
		TenantID:       "DAA-CORE", // Detroit Automation Academy (Main)
		FirstName:      "Justin",
		LastName:       "Smith",
		Email:          "jsmith@example.com",
		Cohort:         "Feb 2026",
		EnrollmentDate: time.Now(),
		Status:         "Active",
	},
	{
		ID:             "2",
		TenantID:       "BGC-METRO", // A hypothetical partner academy
		FirstName:      "Alise",
		LastName:       "Dixon",
		Email:          "adixon@bgcsm.org",
		Cohort:         "Spring 2026",
		EnrollmentDate: time.Now(),
		Status:         "Active",
	},
}

func StudentsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Multi-tenancy: Get tenant_id from query (simulating Auth/JWT)
	tenantID := r.URL.Query().Get("tenant_id")
	if tenantID == "" {
		http.Error(w, "tenant_id required", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodGet:
		// Filter students by tenant_id
		var filtered []models.Student
		for _, s := range mockStudents {
			if s.TenantID == tenantID {
				filtered = append(filtered, s)
			}
		}
		json.NewEncoder(w).Encode(filtered)
	case http.MethodPost:
		var s models.Student
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		s.ID = fmt.Sprintf("%d", len(mockStudents)+1)
		s.TenantID = tenantID // Assign to current tenant
		s.EnrollmentDate = time.Now()
		mockStudents = append(mockStudents, s)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(s)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
