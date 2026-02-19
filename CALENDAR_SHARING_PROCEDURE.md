# 📅 DETROIT AUTOMATION ACADEMY - CALENDAR SHARING PROCEDURE

**Prepared for:** @ADMIN, @SCHEDULER  
**Date:** February 1, 2026  
**Purpose:** Step-by-step procedure to share DAA calendar with team members  
**Related Documents:** [CALENDAR_FEB_MAR_2025.md](CALENDAR_FEB_MAR_2025.md), [Scheduler Agent](../../.github/agents/scheduler.agent.md)

---

## 🎯 OBJECTIVE

Share the Detroit Automation Academy calendar (CALENDAR_FEB_MAR_2025.md) with all leadership team members, instructors, and administrative staff via Google Calendar for real-time visibility and synchronized reminders.

---

## 📋 STEP-BY-STEP PROCEDURE

### STEP 1: Export Calendar to ICS Format

**Responsibility:** @SCHEDULER

1. Open [CALENDAR_FEB_MAR_2025.md](CALENDAR_FEB_MAR_2025.md) in text editor
2. Convert markdown calendar to iCalendar (.ics) format using one of these methods:

   **Option A: Manual Conversion**
   - Copy all events from calendar
   - Use online converter (e.g., markdown-to-ics.app)
   - Save as: `DAA_Calendar_FEB_MAR_2025.ics`

   **Option B: Python Script (Automated)**
   ```bash
   python3 -c "
   from datetime import datetime
   import re
   
   # Parse markdown calendar and generate ICS
   # Events: B&G Club (Feb 3-4), Orientation (Feb 5), 
   # Portal Launch (Feb 7), First Cohort Launch (Mar 8)
   
   ics_content = '''BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//Detroit Automation Academy//DAA Calendar//EN
   CALSCALE:GREGORIAN
   METHOD:PUBLISH
   X-WR-CALNAME:Detroit Automation Academy - Feb/Mar 2025
   X-WR-TIMEZONE:America/Detroit
   
   [Events to be added]
   END:VCALENDAR'''
   
   with open('DAA_Calendar_FEB_MAR_2025.ics', 'w') as f:
       f.write(ics_content)
   print('Calendar exported as DAA_Calendar_FEB_MAR_2025.ics')
   "
   ```

3. Verify .ics file contains all key dates:
   - ✅ Feb 3-4: B&G Club Grand Opening Event
   - ✅ Feb 5: Instructor Orientation + Leadership Meeting
   - ✅ Feb 7: Application Portal Opens
   - ✅ Mar 5: New Student Orientation
   - ✅ Mar 8: First Cohort Launch

---

### STEP 2: Create Google Calendar

**Responsibility:** @SCHEDULER (or @ADMIN)

1. **Access Google Calendar:**
   - Go to [Google Calendar](https://calendar.google.com)
   - Sign in with Detroit Automation Academy Google account

2. **Create New Calendar:**
   - Click **"+ Create"** (left sidebar)
   - Calendar name: `Detroit Automation Academy - Schedule`
   - Description: `Official DAA event calendar - Feb/Mar 2025 and ongoing 12-week cohort schedule`
   - Timezone: `America/Detroit (EST/EDT)`
   - Click **Create**

3. **Calendar Settings:**
   - Click calendar name → **Settings**
   - Enable: **"Make available to public"** (optional, if public viewing desired)
   - Enable: **"Show as busy"**
   - Notifications: 
     - Email: 1 day before
     - Popup: 15 minutes before
   - Click **Save**

---

### STEP 3: Import ICS File into Google Calendar

**Responsibility:** @SCHEDULER

1. **Import Calendar Data:**
   - In Google Calendar, click **Settings** (gear icon)
   - Select **"Import & Export"** (left menu)
   - Click **"Select file from your computer"**
   - Choose `DAA_Calendar_FEB_MAR_2025.ics`
   - Select target calendar: `Detroit Automation Academy - Schedule`
   - Click **Import**

2. **Verify Import:**
   - All events appear on correct dates
   - Times are accurate (check AM/PM)
   - Recurring events show correctly (if applicable)
   - No duplicate entries

---

### STEP 4: Share Calendar with Team Members

**Responsibility:** @SCHEDULER (sharing), @ADMIN (distribution list)

#### Method A: Direct Sharing (Recommended)

1. **Access Calendar Sharing:**
   - Google Calendar → Click calendar name → **Settings**
   - Scroll to **"Share with specific people"**
   - Click **"Add people"**

2. **Add Team Members:**
   - Enter email addresses or use auto-complete for:

   | Role | Suggested Recipient | Permission |
   |------|-------------------|-----------|
   | **Founder** | Justin Smith | Editor |
   | **Chief Technology Officer** | [TBD] | Editor |
   | **Chief Operating Officer** | [TBD] | Viewer |
   | **Lead Instructor (Phase 1-3)** | [TBD] | Viewer |
   | **Admin Assistant** | [Your Name] | Editor |
   | **Lead Technician** | [TBD] | Viewer |
   | **External: B&G Club Contact** | [Contact Email] | Viewer |

3. **Permission Levels:**
   - **Editor:** Can add/modify/delete events (admin staff)
   - **Viewer:** Can see events but not modify (instructors, external)

4. **Send Invitations:**
   - Google Calendar auto-sends notifications to each recipient
   - Verify: Team members receive "You've been invited to share a calendar" email

#### Method B: Public Calendar Link (Alternative)

1. **Generate Shareable Link:**
   - Calendar Settings → **Integrate calendar**
   - Copy **Public URL** (if calendar is public)
   - Share via: Slack, email, website

2. **Public Access:**
   - Anyone with link can view calendar
   - No calendar editing by external viewers
   - Best for: Public event visibility (donors, press, students)

---

### STEP 5: Configure Reminder System

**Responsibility:** @SCHEDULER

1. **Event-Based Reminders:**
   - Each calendar event should have notifications:
     - Email: 3 days before
     - Email: 1 day before
     - Popup: Morning of event

2. **Recurring Reminders:**
   - Weekly: Monday 9:00 AM (admin action item review)
   - Daily: 4:00 PM (leadership standup meetings Feb 1-3)
   - Bi-weekly: Monday 10:00 AM (equipment inventory check)

3. **Configure in Google Calendar:**
   - Select each event → **Edit**
   - Add notification: **Email, 3 days before**
   - Add notification: **Email, 1 day before**
   - Add notification: **Popup, 9:00 AM day-of**
   - Save event

---

### STEP 6: Sync with Other Platforms (Optional)

**Responsibility:** @SCHEDULER

#### Outlook Integration
```
1. Export calendar: Google Calendar → Settings → Export → Download
2. File format: .ics or .csv (for Outlook compatibility)
3. Outlook: File → Open & Export → Import iCalendar
4. Select downloaded file and target calendar
5. Repeat monthly as events are updated
```

#### Slack Integration
```
1. Slack Workspace → Add app → Google Calendar
2. Authenticate and authorize
3. Commands available:
   - /gcal today → Show today's events
   - /gcal tomorrow → Show tomorrow's events
   - /gcal schedule → Post calendar week to Slack
```

#### Microsoft Teams Integration
```
1. Teams Channel → + Apps → Google Calendar
2. Or: Use Zapier/Make to sync calendars automatically
3. Daily digest: Post calendar summary to team channel
```

---

### STEP 7: Establish Governance & Maintenance

**Responsibility:** @ADMIN (with @SCHEDULER review)

| Task | Frequency | Owner | Action |
|------|-----------|-------|--------|
| **Update calendar** | Weekly (Mondays 9am) | @ADMIN | Review action items, add new events |
| **Verify reminders sent** | Daily | @SCHEDULER | Check email notifications working |
| **Share with new staff** | On hire | @ADMIN | Send calendar invite + permissions |
| **Archive old events** | Monthly | @SCHEDULER | Move completed events to archive calendar |
| **Backup calendar** | Monthly | @SCHEDULER | Export .ics file, store in Google Drive |

---

## 🔐 SECURITY CONSIDERATIONS

✅ **Do:**
- Use role-based access (editors vs. viewers)
- Keep calendar internal/private unless public viewing approved
- Audit sharing permissions monthly
- Use unique passwords for shared calendar account
- Enable 2-factor authentication

❌ **Don't:**
- Share calendar with public email addresses (security risk)
- Expose sensitive meeting details in event descriptions
- Grant editor access to external parties without authorization
- Use generic passwords
- Store .ics files in unsecured locations

---

## 📞 SUPPORT & ESCALATION

| Issue | Contact | Escalation |
|-------|---------|------------|
| Can't access calendar | @SCHEDULER → Justin Smith | CTO review permissions |
| Events not syncing | @SCHEDULER → Google Support | Check API credentials |
| Reminders not working | @ADMIN → @SCHEDULER | Verify notification settings |
| Need new access | @ADMIN → @SCHEDULER | Add new email to sharing list |

---

## ✅ COMPLETION CHECKLIST

- [ ] Calendar exported to .ics format
- [ ] Google Calendar created with correct timezone
- [ ] .ics file imported (verify no duplicates)
- [ ] Team members added with appropriate permissions
- [ ] Reminders configured (3-day, 1-day, morning-of)
- [ ] Test invitation sent and receipt confirmed
- [ ] Sync configured with Outlook/Teams/Slack (if needed)
- [ ] Governance process documented
- [ ] Backup .ics file stored securely
- [ ] Security audit completed

---

**Procedure Version:** 1.0  
**Date Completed:** [Fill in when done]  
**Completed By:** @SCHEDULER / @ADMIN  
**Next Review:** Monthly (first Monday of each month)
