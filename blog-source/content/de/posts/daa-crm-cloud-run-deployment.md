## C:\Users\dbkr\workspace\daa-public-staging\blog-source\content\de\posts\daa-crm-cloud-run-deployment.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-13
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis

﻿## C:\Users\dbkr\workspace\daa-public-staging\blog-source\content\de\posts\daa-crm-cloud-run-deployment.md
---
title: "Anmeldung zur Detroit Automation Academy Live: Von Null auf Cloud Run in einer Session"
date: 2026-02-28T05:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["Detroit Automation Academy", "Engineering"]
tags: ["gcp", "cloud-run", "react", "golang", "crm", "devops"]
description: "Wie wir ein voll funktionsfÃ¤higes mandantenfÃ¤higes CRM fÃ¼r die Detroit Automation Academy aufgebaut und bereitgestellt haben â€” von fehlerhaften Go-String-Literalen bis hin zu einem Live-React-Registrierungsportal auf Google Cloud Run."
---

Heute Abend haben wir die Registrierung fÃ¼r die Detroit Automation Academy von einem fehlerhaften Build zu einem vollstÃ¤ndig bereitgestellten, Ã¶ffentlich zugÃ¤nglichen System in einer einzigen Engineering-Session gebracht. Hier ist, wie das tatsÃ¤chlich aussah.

## Ausgangspunkt: FÃ¼nf aufeinanderfolgende Build-Fehler

Das `deploy.sh`-Skript existierte. Die Docker-Images existierten. Was nicht existierte: ein funktionierender Build.

Der erste Fehler war ein Go-Syntaxfehler in `backend/main.go` â€” ein roher Zeilenumbruch, der in ein String-Literal eingebettet war:

```go
// Fehlerhaft
fmt.Printf("Detroit Automation Academy Registration Backend starting on port %s...
", port)

// Korrigiert
fmt.Printf("Detroit Automation Academy Registration Backend starting on port %s...
", port)
```

Go erlaubt keine nicht maskierten ZeilenumbrÃ¼che innerhalb von String-Literalen. Die Korrektur bestand aus einem einzigen Zeichen.

## IAM-Berechtigungskaskade

Nachdem das Backend erstellt wurde, schlug der Push zu GCR fehl:

```
denied: gcr.io repo does not exist. Creating on push requires the
artifactregistry.repositories.createOnPush permission
```

Das Compute-Service-Konto hatte `artifactregistry.admin`, aber das Cloud Build-Service-Konto hatte nicht `roles/editor`. Wir haben es beiden SAs gewÃ¤hrt und der Build wurde abgeschlossen.

## Das fehlende Frontend-GerÃ¼st

Das React-Frontend hatte `App.tsx` und `EnrollmentForm.tsx` â€” aber kein `public/index.html`, kein `src/index.tsx` und eine ungÃ¼ltige `tsconfig.json`. `react-scripts build` erfordert alle drei.

Wir haben auch einen TypeScript-Fehler gefunden: Innerhalb eines `if (view === 'enroll')` Early-Return-Blocks verengte TypeScript `view` auf den Literaltyp `'enroll'`, was `view === 'admin'` zu einem toten Vergleich machte (TS2367). Behoben durch Refactoring zu einem einzigen `return` mit bedingtem Rendering.

## Ersetzen von Terraform durch direkte Bereitstellung

Das `deploy.sh`-Skript endete mit `terraform init && terraform apply` â€” aber Terraform war nicht installiert und das Infra-Verzeichnis existierte nicht. Anstatt zu blockieren, ersetzten wir es durch direkte `gcloud run deploy`-Aufrufe. Sowohl das Backend als auch das Frontend waren innerhalb von 60 Sekunden live.

## Firestore-Persistenz

Das ursprÃ¼ngliche Backend speicherte Studenten im Arbeitsspeicher â€” gelÃ¶scht bei jedem Kaltstart. Wir haben `handlers/students.go` umgeschrieben, um Firestore mit einem eleganten In-Memory-Fallback zu verwenden:

- Sammlungen haben mandantenspezifische NamensrÃ¤ume: `students_DAA-CORE`, `students_BGC-METRO`
- Wenn Firestore nicht erreichbar ist, greift der Handler auf thread-sicheren In-Memory-Speicher zurÃ¼ck
- Der `/health`-Endpunkt meldet nun `"storage":"firestore"` oder `"storage":"memory"`, sodass Sie auf einen Blick sehen kÃ¶nnen, welcher aktiv ist

## Was jetzt lÃ¤uft

| Dienst | URL |
|---------|-----|
| Backend-API (Go + Firestore) | `daa-crm-backend-87748455115.us-central1.run.app` |
| Registrierungsportal (React) | `enroll.detroitautomationacademy.com` |

Das Admin-Dashboard ist jetzt durch ein PIN-Gate geschÃ¼tzt â€” Mitarbeiter geben den Passcode einmal pro Sitzung ein, der in `sessionStorage` gespeichert wird. Das Registrierungsformular bleibt vollstÃ¤ndig Ã¶ffentlich.

---

*Die Kohorte der Detroit Automation Academy beginnt am 8. MÃ¤rz 2026 in der Station @ Michigan Central.*
