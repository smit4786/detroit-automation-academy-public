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
	"github.com/smit4786/detroit-automation-academy-public/crm/backend/models"
	"google.golang.org/api/iterator"
)

var (
	instMu       sync.RWMutex
	memInstructors = []models.Instructor{
		{
			ID: "seed-inst-1", TenantID: "DAA-CORE",
			FirstName: "Lead", LastName: "Instructor",
			Email: "instructor@example.com", Status: "Active",
			CreatedAt: time.Now(),
		},
	}
)

func MakeInstructorsHandler(fsClient *firestore.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		tenantID := r.URL.Query().Get("tenant_id")
		if tenantID == "" {
			tenantID = "ALL"
		}

		switch r.Method {
		case http.MethodGet:
			instructors := listInstructors(r.Context(), fsClient, tenantID)
			json.NewEncoder(w).Encode(instructors)

		case http.MethodPost:
			var i models.Instructor
			if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
				http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
				return
			}
			i.TenantID = tenantID
			i.CreatedAt = time.Now()
			if i.Status == "" {
				i.Status = "Active"
			}
			if err := saveInstructor(r.Context(), fsClient, &i); err != nil {
				http.Error(w, `{"error":"failed to save instructor"}`, http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(i)

		case http.MethodDelete:
			id := r.URL.Query().Get("id")
			if id == "" {
				http.Error(w, `{"error":"id required"}`, http.StatusBadRequest)
				return
			}
			if err := deleteInstructor(r.Context(), fsClient, tenantID, id); err != nil {
				http.Error(w, `{"error":"failed to delete instructor"}`, http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)

		default:
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	}
}

func listInstructors(ctx context.Context, fs *firestore.Client, tenantID string) []models.Instructor {
	if fs == nil {
		instMu.RLock()
		defer instMu.RUnlock()
		var out []models.Instructor
		for _, i := range memInstructors {
			if tenantID == "ALL" || i.TenantID == tenantID {
				out = append(out, i)
			}
		}
		if out == nil {
			return []models.Instructor{}
		}
		return out
	}

	var instructors []models.Instructor
	col := "instructors"
	if tenantID != "ALL" {
		iter := fs.Collection(col).Where("tenant_id", "==", tenantID).Documents(ctx)
		defer iter.Stop()
		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				log.Printf("firestore error: %v", err)
				return []models.Instructor{}
			}
			var inst models.Instructor
			doc.DataTo(&inst)
			inst.ID = doc.Ref.ID
			instructors = append(instructors, inst)
		}
	} else {
		iter := fs.Collection(col).Documents(ctx)
		defer iter.Stop()
		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			var inst models.Instructor
			doc.DataTo(&inst)
			inst.ID = doc.Ref.ID
			instructors = append(instructors, inst)
		}
	}
	if instructors == nil {
		return []models.Instructor{}
	}
	return instructors
}

func saveInstructor(ctx context.Context, fs *firestore.Client, i *models.Instructor) error {
	if fs == nil {
		instMu.Lock()
		defer instMu.Unlock()
		i.ID = fmt.Sprintf("mem-inst-%d", len(memInstructors)+1)
		memInstructors = append(memInstructors, *i)
		return nil
	}
	ref, _, err := fs.Collection("instructors").Add(ctx, i)
	if err == nil {
		i.ID = ref.ID
	}
	return err
}

func deleteInstructor(ctx context.Context, fs *firestore.Client, tenantID, id string) error {
	if fs == nil {
		instMu.Lock()
		defer instMu.Unlock()
		for i, inst := range memInstructors {
			if inst.ID == id {
				memInstructors = append(memInstructors[:i], memInstructors[i+1:]...)
				return nil
			}
		}
		return fmt.Errorf("not found")
	}
	_, err := fs.Collection("instructors").Doc(id).Delete(ctx)
	return err
}
