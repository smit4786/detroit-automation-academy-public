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
)

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
			Cohort: "Feb 2026", EnrollmentDate: time.Now(), Status: "Active",
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
			Cohort: "Feb 2026", EnrollmentDate: time.Now(), Status: "Active",
		},
	}
)

// MakeStudentsHandler returns an HTTP handler wired to Firestore (or memory fallback).
func MakeStudentsHandler(fsClient *firestore.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// CORS — allow the CRM frontend origin
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		tenantID := r.URL.Query().Get("tenant_id")
		if tenantID == "" {
			http.Error(w, `{"error":"tenant_id required"}`, http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodGet:
			students := listStudents(r.Context(), fsClient, tenantID)
			if err := json.NewEncoder(w).Encode(students); err != nil {
				log.Printf("encode error: %v", err)
			}

		case http.MethodPost:
			var s models.Student
			if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
				http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
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
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(s)

		default:
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	}
}

// ── Firestore helpers ─────────────────────────────────────────────────────── //

func collectionName(tenantID string) string {
	return fmt.Sprintf("students_%s", tenantID)
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

// ── In-memory fallback helpers ────────────────────────────────────────────── //

func listFromMemory(tenantID string) []models.Student {
	memMu.RLock()
	defer memMu.RUnlock()
	var out []models.Student
	for _, s := range memStudents {
		if s.TenantID == tenantID {
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
