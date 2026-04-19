## C:\Users\dbkr\workspace\daa-public-staging\blog-source\content\de\posts\cicd-pipeline-postmortem.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-13
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis

﻿## C:\Users\dbkr\workspace\daa-public-staging\blog-source\content\de\posts\cicd-pipeline-postmortem.md
---
title: "Fehlerbehebung in unserer CI/CD-Pipeline: Submodule, leere Commits und das Clawd QA-Gate"
date: 2026-02-28T03:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["Infrastruktur", "DevOps"]
tags: ["ci-cd", "hugo", "github-actions", "clawd", "pipeline"]
description: "Eine Analyse wiederkehrender Bereitstellungsfehler in unserer Hugo-Blog-Pipeline â€” und die architektonischen Ã„nderungen, die wir vorgenommen haben, um sie zu verhindern."
---

Der Automated Insights Blog hatte ein wiederkehrendes CI/CD-Problem: Bereitstellungen, die lokal funktionierten, schlugen in GitHub Actions lautlos fehl oder waren in Actions erfolgreich, produzierten aber eine fehlerhafte Website. Hier ist die Ursachenanalyse und was wir geÃ¤ndert haben.

## Die drei Fehlermodi

1. **Hugo-Build erfolgreich, Website-Inhalt fehlt** â€” das `public/`-Verzeichnis wurde generiert, aber der Git-Commit-Schritt schlug lautlos fehl, weil es nichts Neues zu committen gab. Der Bereitstellungsschritt wurde trotzdem ausgefÃ¼hrt und Ã¼bertrug einen veralteten Build.

2. **Theme-Submodul nicht initialisiert** â€” das Ananke-Theme ist ein Git-Submodul. Frische GitHub Actions Runner klonen das Repo, initialisieren Submodule aber nicht automatisch. Der Build wurde mit einem leeren `themes/ananke/`-Verzeichnis fortgesetzt, was einen ungestylten Build erzeugte, der dennoch mit Code 0 beendet wurde.

3. **VerzÃ¶gerung bei der Cache-Invalidierung** â€” Ã¼ber das CDN zwischengespeicherte Seiten wurden nach einer neuen Bereitstellung veraltet ausgeliefert.

## Fix 1: Submodul-Initialisierung

```yaml
- uses: actions/checkout@v4
  with:
    submodules: true        # â† dies fehlte
    fetch-depth: 0
```

Ohne `submodules: true` findet Hugo `theme = "ananke"`, sucht in `themes/ananke/layouts/`, findet nichts und greift auf Standard-Templates zurÃ¼ck â€” komplett ungestylt.

## Fix 2: Der Schutz vor leeren Commits

```yaml
# Vorher â€” committet immer, schlÃ¤gt fehl, wenn sich nichts geÃ¤ndert hat
- run: |
    git add public/
    git commit -m "Deploy"
    git push

# Nachher â€” Ã¼berspringt, wenn sich nichts geÃ¤ndert hat
- run: |
    git add public/
    git diff --staged --quiet || git commit -m "chore: deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git push
```

`git diff --staged --quiet` beendet mit 0 (keine Ã„nderungen) â†’ Commit Ã¼berspringen. Beendet ungleich Null (Ã„nderungen vorhanden) â†’ Commit und Push.

## Das Clawd QA-Gate

Da das Unternehmen Automated Technologies auf dem autonomen Agenten-Framework Clawd basiert, haben wir einen `qa_gate.py`-Agenten eingerichtet, um Bereitstellungen automatisch zu Ã¼berprÃ¼fen:

1. Ruft die URL der Live-Site nach einer Bereitstellung ab.
2. ÃœberprÃ¼ft, ob der Titel des neuesten Beitrags im HTML vorhanden ist.
3. ÃœberprÃ¼ft, ob der `Last-Modified`-Response-Header neuer ist als der Zeitstempel der vorherigen Bereitstellung.
4. LÃ¤sst die Pipeline fehlschlagen, wenn eine der PrÃ¼fungen nicht bestanden wird.

Dies wandelt die BereitstellungsÃ¼berprÃ¼fung von einer manuellen PrÃ¼fung in ein automatisiertes Gate um â€” im Einklang mit der Arbeitsweise aller Clawd-Agenten.

## Aktueller Status

Die Pipeline lÃ¤uft nun zuverlÃ¤ssig. Offene Punkte:

- **Mehrsprachige BeitrÃ¤ge** â€” deutsche und russische Ãœbersetzungen sind spÃ¤rlich. Englischer Inhalt ist maÃŸgeblich.
- **Suche** â€” Evaluierung von Pagefind (clientseitig, ohne AbhÃ¤ngigkeiten) fÃ¼r einen zukÃ¼nftigen Sprint.

---

*Clawd ist das autonome KI-Agenten-Framework, das den Betrieb des Unternehmens Automated Technologies unterstÃ¼tzt.*
