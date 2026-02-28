package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/firestore"
	"github.com/smit4786/detroit-automation-academy-public/crm/backend/handlers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		projectID = "project-9e091b7d-1e8e-4a4e-963"
	}

	ctx := context.Background()
	fsClient, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		log.Printf("⚠️  Firestore unavailable (%v) — using in-memory fallback", err)
		fsClient = nil
	} else {
		log.Printf("✅ Firestore connected (project: %s)", projectID)
	}

	fmt.Printf("🚀 DAA CRM Backend starting on port %s...\n", port)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if fsClient != nil {
			fmt.Fprintf(w, `{"status":"ok","storage":"firestore"}`)
		} else {
			fmt.Fprintf(w, `{"status":"ok","storage":"memory"}`)
		}
	})

	http.HandleFunc("/api/students", handlers.MakeStudentsHandler(fsClient))

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
