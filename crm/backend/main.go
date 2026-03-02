package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"cloud.google.com/go/firestore"
	"github.com/smit4786/detroit-automation-academy-public/crm/backend/handlers"
	"google.golang.org/api/idtoken"
)

var (
	ALLOWED_EMAILS = []string{"dbkrsmith@gmail.com", "smit4786@gmail.com"}
	CLIENT_ID      = os.Getenv("GOOGLE_CLIENT_ID")
)

func isAllowed(email string) bool {
	for _, a := range ALLOWED_EMAILS {
		if a == email {
			return true
		}
	}
	return false
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Set robust CORS headers
		origin := r.Header.Get("Origin")
		allowedOrigins := map[string]bool{
			"https://enroll.detroitautomationacademy.com":   true,
			"https://daa-crm-frontend-ww72p2xhtq-uc.a.run.app": true,
			"https://detroitautomationacademy.com":          true,
		}

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			// Default to first allowed origin if not specified
			w.Header().Set("Access-Control-Allow-Origin", "https://enroll.detroitautomationacademy.com")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 2. Handle pre-flight (OPTIONS) requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// 3. Bypass auth for health checks or public registration (POST)
		if r.URL.Path == "/health" || (r.URL.Path == "/api/students" && r.Method == http.MethodPost) {
			next(w, r)
			return
		}

		// 4. Validate Authorization Header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized: Missing Authorization Header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		// 5. Validate Google ID Token
		payload, err := idtoken.Validate(context.Background(), token, CLIENT_ID)
		if err != nil {
			log.Printf("Token validation failed: %v", err)
			http.Error(w, "Unauthorized: Invalid Token", http.StatusUnauthorized)
			return
		}

		// 6. Check if email is in ALLOWED_EMAILS
		email := payload.Claims["email"].(string)
		if !isAllowed(email) {
			log.Printf("Forbidden access attempt: %s", email)
			http.Error(w, "Forbidden: Account not authorized", http.StatusForbidden)
			return
		}

		// Proceed to next handler
		next(w, r)
	}
}

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

	fmt.Printf("🚀 Detroit Automation Academy Registration Backend starting on port %s...\n", port)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if fsClient != nil {
			fmt.Fprintf(w, `{"status":"ok","storage":"firestore"}`)
		} else {
			fmt.Fprintf(w, `{"status":"ok","storage":"memory"}`)
		}
	})

	// Wrap students handler with Auth Middleware
	http.HandleFunc("/api/students", AuthMiddleware(handlers.MakeStudentsHandler(fsClient)))

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
