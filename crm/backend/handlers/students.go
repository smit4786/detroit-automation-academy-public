package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"

	"github.com/smit4786/detroit-automation-academy-public/crm/backend/models"
	"github.com/smit4786/detroit-automation-academy-public/crm/backend/notifications"
)

func validateStudent(s models.Student) error {
	if s.FirstName == "" || s.LastName == "" {
		return fmt.Errorf("first and last name are required")
	}
	if s.Email == "" {
		return fmt.Errorf("email is required")
	}
	return nil
}

// ── In-memory fallback ────────────────────────────────────────────────────── //
var (
	memMu       sync.RWMutex
	memStudents = []models.Student{
		{
			ID: "seed-1", TenantID: "DAA-CORE",
			FirstName: "Justin", LastName: "Smith",
			Email: "jsmith@example.com", Phone: "(313) 555-0001",
			AgeGrade: "18+", EducationLevel: "Professional",
			ProgramInterest: []string{"Automation Technology", "CNC Programming"},
			ExperienceLevel: "Professional", Language: "English",
			HearAboutUs: "Website", Goals: "Scale Automated Technologies operations.",
			Cohort: "Mar 2026", EnrollmentDate: time.Now(), Status: "Active",
		},
		{
			ID: "seed-test-1", TenantID: "DAA-CORE",
			FirstName: "Justin", LastName: "Smith (Test)",
			Email: "justin.smith.test@example.com", Phone: "(313) 555-9999",
			AgeGrade: "Professional", EducationLevel: "Bachelors",
			ProgramInterest: []string{"Drone Operations & AI"},
			ExperienceLevel: "Intermediate", Language: "English",
			HearAboutUs: "Internal Test", Goals: "Verify production database registration flow.",
			Cohort: "Mar 2026", EnrollmentDate: time.Now(), Status: "Inquiry",
		},
		{
			ID: "prod-test-user", TenantID: "DAA-CORE",
			FirstName: "Justin", LastName: "Smith (Prod Test)",
			Email: "jsmith.prod@example.com", Phone: "(313) 555-0100",
			AgeGrade: "Professional", EducationLevel: "Senior Technical Lead",
			ProgramInterest: []string{"Automation Technology"},
			ExperienceLevel: "Expert", Language: "English",
			HearAboutUs: "System Verification", Goals: "Confirm production-ready status for Registration Portal.",
			Cohort: "Mar 2026", EnrollmentDate: time.Now(), Status: "Active",
		},
	}
)

// MakeStudentsHandler returns an HTTP handler wired to Firestore (or memory fallback).
func MakeStudentsHandler(fsClient *firestore.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		tenantID := r.URL.Query().Get("tenant_id")
		if tenantID == "" {
			tenantID = "ALL" // Default to ALL for admins if not specified
		}

		switch r.Method {
		case http.MethodGet:
			var students []models.Student
			if tenantID == "ALL" {
				students = listAllStudents(r.Context(), fsClient)
			} else {
				students = listStudents(r.Context(), fsClient, tenantID)
			}
			if err := json.NewEncoder(w).Encode(students); err != nil {
				log.Printf("encode error: %v", err)
			}

		case http.MethodPost:
			var s models.Student
			if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
				http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
				return
			}
			if err := validateStudent(s); err != nil {
				http.Error(w, fmt.Sprintf(`{"error":"%v"}`, err), http.StatusBadRequest)
				return
			}
			s.TenantID = tenantID
			s.EnrollmentDate = time.Now()
			if s.Status == "" {
				s.Status = "Inquiry"
			}

			if err := saveStudent(r.Context(), fsClient, &s); err != nil {
				log.Printf("save error: %v", err)
				http.Error(w, `{"error":"failed to save student"}`, http.StatusInternalServerError)
				return
			}

			// 🚀 Send Automated Notifications
			go func(student models.Student) {
				notifications.SendWelcomeEmail(student)
				notifications.SendAdminAlert(student)
			}(s)

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(s)

		case http.MethodPut:
			// Handle updating student (specifically attendance)
			var s models.Student
			if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
				http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
				return
			}
			if s.ID == "" {
				http.Error(w, `{"error":"student ID required for update"}`, http.StatusBadRequest)
				return
			}
			s.TenantID = tenantID
			if err := updateStudent(r.Context(), fsClient, &s); err != nil {
				log.Printf("update error: %v", err)
				http.Error(w, `{"error":"failed to update student"}`, http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(s)

		case http.MethodDelete:
			id := r.URL.Query().Get("id")
			if id == "" {
				http.Error(w, `{"error":"id required"}`, http.StatusBadRequest)
				return
			}
			if err := deleteStudent(r.Context(), fsClient, tenantID, id); err != nil {
				http.Error(w, `{"error":"failed to delete student"}`, http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)

		default:
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	}
}

// ── Firestore helpers ─────────────────────────────────────────────────────── //

func collectionName(tenantID string) string {
	return fmt.Sprintf("students_%s", tenantID)
}

func listAllStudents(ctx context.Context, fs *firestore.Client) []models.Student {
	if fs == nil {
		return listFromMemory("ALL")
	}
	tenants := []string{"DAA-CORE", "BGC-METRO"}
	var all []models.Student
	for _, t := range tenants {
		all = append(all, listStudents(ctx, fs, t)...)
	}
	return all
}

func listStudents(ctx context.Context, fs *firestore.Client, tenantID string) []models.Student {
	if fs == nil {
		return listFromMemory(tenantID)
	}

	var students []models.Student
	iter := fs.Collection(collectionName(tenantID)).Documents(ctx)
	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("firestore list error: %v — falling back to memory", err)
			return listFromMemory(tenantID)
		}
		var s models.Student
		if err := doc.DataTo(&s); err != nil {
			log.Printf("firestore decode error: %v", err)
			continue
		}
		s.ID = doc.Ref.ID
		students = append(students, s)
	}

	if students == nil {
		students = []models.Student{}
	}
	return students
}

func deleteStudent(ctx context.Context, fs *firestore.Client, tenantID, id string) error {
	if fs == nil {
		memMu.Lock()
		defer memMu.Unlock()
		for i, s := range memStudents {
			if s.ID == id && s.TenantID == tenantID {
				memStudents = append(memStudents[:i], memStudents[i+1:]...)
				return nil
			}
		}
		return fmt.Errorf("student not found in memory")
	}

	_, err := fs.Collection(collectionName(tenantID)).Doc(id).Delete(ctx)
	return err
}

func saveStudent(ctx context.Context, fs *firestore.Client, s *models.Student) error {
	if fs == nil {
		return saveToMemory(s)
	}

	ref, _, err := fs.Collection(collectionName(s.TenantID)).Add(ctx, s)
	if err != nil {
		log.Printf("firestore write error: %v — falling back to memory", err)
		return saveToMemory(s)
	}
	s.ID = ref.ID
	return nil
}

func updateStudent(ctx context.Context, fs *firestore.Client, s *models.Student) error {
	if fs == nil {
		memMu.Lock()
		defer memMu.Unlock()
		for i, existing := range memStudents {
			if existing.ID == s.ID && existing.TenantID == s.TenantID {
				// Update fields
				memStudents[i].Attendance = s.Attendance
				memStudents[i].Status = s.Status
				memStudents[i].Cohort = s.Cohort
				return nil
			}
		}
		return fmt.Errorf("student not found in memory")
	}

	_, err := fs.Collection(collectionName(s.TenantID)).Doc(s.ID).Set(ctx, map[string]interface{}{
		"attendance": s.Attendance,
		"status":     s.Status,
		"cohort":     s.Cohort,
	}, firestore.MergeAll)
	return err
}

// ── In-memory fallback helpers ────────────────────────────────────────────── //

func listFromMemory(tenantID string) []models.Student {
	memMu.RLock()
	defer memMu.RUnlock()
	var out []models.Student
	for _, s := range memStudents {
		if tenantID == "ALL" || s.TenantID == tenantID {
			out = append(out, s)
		}
	}
	if out == nil {
		out = []models.Student{}
	}
	return out
}

func saveToMemory(s *models.Student) error {
	memMu.Lock()
	defer memMu.Unlock()
	s.ID = fmt.Sprintf("mem-%d", len(memStudents)+1)
	memStudents = append(memStudents, *s)
	return nil
}
