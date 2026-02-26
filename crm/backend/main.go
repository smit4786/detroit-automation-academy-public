package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/smit4786/detroit-automation-academy-public/crm/backend/handlers"
)

func main() {
	port := "8080"
	fmt.Printf("DAA CRM Backend starting on port %s...
", port)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK")
	})

	http.HandleFunc("/api/students", handlers.StudentsHandler)

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
