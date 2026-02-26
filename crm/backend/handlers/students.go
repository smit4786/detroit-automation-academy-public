package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/smit4786/detroit-automation-academy-public/crm/backend/models"
)

// Mock data for initial development
var mockStudents = []models.Student{
	{
		ID:             "1",
		FirstName:      "Justin",
		LastName:       "Smith",
		Email:          "jsmith@example.com",
		Cohort:         "Feb 2026",
		EnrollmentDate: time.Now(),
		Status:         "Active",
	},
}

func StudentsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	switch r.Method {
	case http.MethodGet:
		json.NewEncoder(w).Encode(mockStudents)
	case http.MethodPost:
		var s models.Student
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		s.ID = fmt.Sprintf("%d", len(mockStudents)+1)
		s.EnrollmentDate = time.Now()
		mockStudents = append(mockStudents, s)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(s)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
