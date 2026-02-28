---
title: "@AT_Diary Sprint 2: Aufbau eines datenschutzorientierten Tagebuchs auf nativen Apple-Frameworks"
date: 2026-02-28T04:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["@AT_Diary", "iOS"]
tags: ["swift", "ios", "musickit", "eventkit", "coredata", "datenschutz"]
description: "Sprint 2 von @AT_Diary ist mit einem erfolgreichen Build abgeschlossen. Unser Architekturansatz: Warum wir uns für native Apple-Frameworks gegenüber Drittanbieter-SDKs entschieden haben und was datenschutzorientiert in der Praxis wirklich bedeutet."
---

Sprint 2 von `@AT_Diary` ist mit einem erfolgreichen Build abgeschlossen. Hier ist, was wir ausgeliefert haben und wie sich die Architektur-Entscheidungen bewähren.

## Die Kernvoraussetzung

Die meisten Tagebuch-Apps verlangen von Ihnen, dass Sie ihren Servern Ihre persönlichsten Daten anvertrauen. AT_Diary tut das nicht. Jedes Datenelement, das es berührt — Ihr Musikverlauf, Ihre Kalenderereignisse, Ihr Standortkontext, Ihre Fotos — wird **auf dem Gerät** verarbeitet und mit iCloud-Verschlüsselung gespeichert. Nichts wird nach Hause gesendet.

## Der Framework-Stack

| Framework | Datendomäne | Datenschutz-Ansatz |
|-----------|-------------|--------------------|
| **MusicKit** | Was Sie hören | Fordert Benutzererlaubnis an; keine Daten verlassen das Gerät |
| **EventKit** | Kalender & Erinnerungen | Lesezugriff auf autorisierte Kalender |
| **Contacts** | Benannte Entitäten in Ihrem Tag | Zugriff nur über Identifier, nie Massenimport |
| **CoreLocation** | Wo Sie sind | Nur signifikante Standortänderungen, gespeichert als Geohash |
| **Photos** | Visuelle Erinnerungsauslöser | Thumbnails lokal generiert, Originale werden nie gelesen |

## Sprint 2 Ergebnisse

### ✅ MusicKit Integration
Autorisierungsfluss abgeschlossen. Die App erfasst den aktuellen Titel zum Zeitpunkt der Erstellung des Eintrags. Album-Cover werden aus dem MusicKit-Katalog abgerufen und als kontextbezogenes Vorschaubild angezeigt.

### ✅ EventKit-Lesepipeline
Kalenderereignisse für den aktuellen Tag werden abgerufen und nach Dauer und Nähe zur aktuellen Zeit eingestuft. Die Top 3 Ereignisse füllen automatisch den Abschnitt „Heutiger Kontext“.

### ✅ CoreData + CloudKit Persistenz
Alle Tagebucheinträge werden in einem `CoreData`-Stack gespeichert, wobei die CloudKit-Synchronisierung über `NSPersistentCloudKitContainer` aktiviert ist. Ihre Einträge werden über alle Apple-Geräte synchronisiert, ohne jemals einen Drittanbieter-Server zu berühren.

### ✅ Erfolgreicher Build
Sauberer Build gegen iOS 18.0 Ziel mit null Warnungen bei allen datenschutzsensiblen Framework-Aufrufen.

## Nächste Schritte: Sprint 3

- **Design der Eintragskarten:** Reichhaltige kontextbezogene Kacheln mit Musik-, Standort- und Ereigniskontext
- **Timeline-Ansicht:** Chronologisches Scrollen mit Umgebungsfarben, die aus den Album-Covern abgeleitet werden
- **On-Device ML:** Verwendung von `CreateML`, um wiederkehrende Muster in Ihren Tagebucheinträgen aufzuzeigen

---

*@AT_Diary ist ein privates Projekt unter Automated Technologies. Derzeit ist keine Veröffentlichung im App Store geplant.*
