---
title: "Fehlerbehebung in unserer CI/CD-Pipeline: Submodule, leere Commits und das Clawd QA-Gate"
date: 2026-02-28T03:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["Infrastruktur", "DevOps"]
tags: ["ci-cd", "hugo", "github-actions", "clawd", "pipeline"]
description: "Eine Analyse wiederkehrender Bereitstellungsfehler in unserer Hugo-Blog-Pipeline — und die architektonischen Änderungen, die wir vorgenommen haben, um sie zu verhindern."
---

Der Automated Insights Blog hatte ein wiederkehrendes CI/CD-Problem: Bereitstellungen, die lokal funktionierten, schlugen in GitHub Actions lautlos fehl oder waren in Actions erfolgreich, produzierten aber eine fehlerhafte Website. Hier ist die Ursachenanalyse und was wir geändert haben.

## Die drei Fehlermodi

1. **Hugo-Build erfolgreich, Website-Inhalt fehlt** — das `public/`-Verzeichnis wurde generiert, aber der Git-Commit-Schritt schlug lautlos fehl, weil es nichts Neues zu committen gab. Der Bereitstellungsschritt wurde trotzdem ausgeführt und übertrug einen veralteten Build.

2. **Theme-Submodul nicht initialisiert** — das Ananke-Theme ist ein Git-Submodul. Frische GitHub Actions Runner klonen das Repo, initialisieren Submodule aber nicht automatisch. Der Build wurde mit einem leeren `themes/ananke/`-Verzeichnis fortgesetzt, was einen ungestylten Build erzeugte, der dennoch mit Code 0 beendet wurde.

3. **Verzögerung bei der Cache-Invalidierung** — über das CDN zwischengespeicherte Seiten wurden nach einer neuen Bereitstellung veraltet ausgeliefert.

## Fix 1: Submodul-Initialisierung

```yaml
- uses: actions/checkout@v4
  with:
    submodules: true        # ← dies fehlte
    fetch-depth: 0
```

Ohne `submodules: true` findet Hugo `theme = "ananke"`, sucht in `themes/ananke/layouts/`, findet nichts und greift auf Standard-Templates zurück — komplett ungestylt.

## Fix 2: Der Schutz vor leeren Commits

```yaml
# Vorher — committet immer, schlägt fehl, wenn sich nichts geändert hat
- run: |
    git add public/
    git commit -m "Deploy"
    git push

# Nachher — überspringt, wenn sich nichts geändert hat
- run: |
    git add public/
    git diff --staged --quiet || git commit -m "chore: deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git push
```

`git diff --staged --quiet` beendet mit 0 (keine Änderungen) → Commit überspringen. Beendet ungleich Null (Änderungen vorhanden) → Commit und Push.

## Das Clawd QA-Gate

Da das Unternehmen Automated Technologies auf dem autonomen Agenten-Framework Clawd basiert, haben wir einen `qa_gate.py`-Agenten eingerichtet, um Bereitstellungen automatisch zu überprüfen:

1. Ruft die URL der Live-Site nach einer Bereitstellung ab.
2. Überprüft, ob der Titel des neuesten Beitrags im HTML vorhanden ist.
3. Überprüft, ob der `Last-Modified`-Response-Header neuer ist als der Zeitstempel der vorherigen Bereitstellung.
4. Lässt die Pipeline fehlschlagen, wenn eine der Prüfungen nicht bestanden wird.

Dies wandelt die Bereitstellungsüberprüfung von einer manuellen Prüfung in ein automatisiertes Gate um — im Einklang mit der Arbeitsweise aller Clawd-Agenten.

## Aktueller Status

Die Pipeline läuft nun zuverlässig. Offene Punkte:

- **Mehrsprachige Beiträge** — deutsche und russische Übersetzungen sind spärlich. Englischer Inhalt ist maßgeblich.
- **Suche** — Evaluierung von Pagefind (clientseitig, ohne Abhängigkeiten) für einen zukünftigen Sprint.

---

*Clawd ist das autonome KI-Agenten-Framework, das den Betrieb des Unternehmens Automated Technologies unterstützt.*
