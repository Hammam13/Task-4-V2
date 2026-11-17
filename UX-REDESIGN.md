# UX Redesign Notes

**Scenario:** a student chooses a community service program, checks how much time and effort earlier volunteers put in and what they said about it, then logs their own hours for a different program.

## 1. Walkthrough of the original app: where the student got stuck

| # | Step | Problem |
|---|------|---------|
| 1 | Choosing a program | The app had no list of programs. Codes only appeared as small grey pills in the feed, and program names were hidden in tooltips. |
| 2 | Opening a program | The code pills didn't look clickable. They were `<span>`s, so you couldn't reach them with the keyboard. The only other way in was "Open program page", hidden inside a `⋯` menu on the Program check card. |
| 3 | Judging effort | Hours were shown as `●●●○○○○○` dots with no number. The filter said "Effort / Level 3" instead of hours. The ring chart's colours were hardcoded and didn't come from the data. |
| 4 | Reading reflections | On the program page, reflections and the team were behind tabs (About / Team / Entries). The stats just said "avg" and "logs", and total hours were missing. Every date read "This term". |
| 5 | Program check | It started on ENV110 without showing the program's name. "Values refresh automatically" added nothing. |
| 6 | Starting to log | "+ New" was faint grey text in the nav. Nothing on the program page let you log hours for that program. |
| 7 | Filling the form | The label said "Program" with no list of valid codes, and you couldn't see which programs you'd already logged. The hours placeholder was "0", which isn't valid. The reflection field had a "…" placeholder and no "optional" label. |
| 8 | Errors | "Missing field." / "Invalid value." / "Not allowed." didn't say which field was wrong or how to fix it. |
| 9 | Feedback | The "Saved." toast only appeared on the dashboard, so saving from a program page gave no feedback. It never went away by itself and didn't say what was saved. |
| 10 | Navigation | "My log" typed "You" into the search box. "Entries" just scrolled. "Refresh" did nothing but show a toast. |
| 11 | Risky action | "Reset data" was a big red button right next to the main action and wiped data without asking. |
| 12 | Readability and accessibility | Text was 9–11px with low contrast, links had no `href`, the dialog didn't support Escape or focus, and the chart bars had no counts. |

## 2. What changed

- **Navigation:** the top bar now has *Programs*, *Volunteer activity*, *My hours* and a clear **+ Log hours** button that is always visible. A three-step guide on the home page mirrors the scenario.
- **Program directory (new):** every program has a card with its name, partner, average hours per entry, number of entries, total hours, the latest reflection and a "✓ You logged hours" badge. Each card is a real link to `#/programs/<CODE>`.
- **Overview:** total entries, average hours per entry, programs with activity and your own hours. The 1–8 hours chart now has counts on the bars, and clicking a bar filters the feed to that number of hours.
- **Program check:** shows the program name as you type, labels the stats clearly (avg hours/entry, entries, total hours) and has a visible "Open program page" button. Suggestions come from the list of known codes.
- **Activity feed:** hours are shown as a number ("3 h") plus a small meter. Each card shows the program name, volunteer, real date and a labelled **Edit** button on your own entries. The search placeholder says what you can search for. The hours filter reads "3 hours". There's an "Only my entries" toggle, a "Showing X of Y" count, "Clear filters", and a helpful message when nothing matches.
- **Program page:** everything is on one page, no tabs. It has a hero with labelled stats, "Log hours for this program" (or "Edit your entry" if you already have one), "Copy share link", About, the 2025/26 and 2024/25 teams with supervisors and coordinators, and every logged entry. Codes not in the directory show the "Program details not yet added" placeholder.
- **Log / edit form:** program chips mark the ones you've already logged. As you type a code, the form confirms the program name. If you already have an entry for that program, it warns you right away and offers "Edit that entry instead". Hours can be picked from 1–8 buttons or typed. The reflection is marked optional, with a placeholder that suggests what to write. Errors appear under the field they belong to, and the form supports Escape and focus.
- **Feedback:** the toast now appears on every page, disappears after 5 seconds, says exactly what was saved ("Logged 4 hours for TEC220 · Digital Skills for Seniors") and links to that program's page.
- **Reset data:** moved to the footer and asks for confirmation before wiping anything.
- **Readability:** body text is 13–15px with better contrast, focus is visible, and there's a skip link and proper labels and `href`s. The layout works on phones.

## 3. Feature checklist (nothing removed)

| Area | Where it is now |
|------|-----------------|
| Browse entries | Volunteer activity. Each card shows the program, hours, reflection, volunteer name and an Edit button on entries owned by You. |
| Search & filter | Search matches program code, reflection or name. The hours filter covers 1–8. Bonus: "Only my entries" toggle and clicking a chart bar. |
| Overview stats | Total entries, average per entry, programs with activity, and the 1–8 hours chart. |
| Program check | Code input with average, entries and total hours. |
| Program details page | `#/programs/<CODE>`: name, partner, description, 2024/25 and 2025/26 teams, and the program's entries. Shareable, with a copy-link button. |
| Log hours | Program code, hours, optional reflection. |
| Edit an entry | Only entries where `owner === 'you'` (enforced in `openForm`). |
| Validation | Code is required. Hours must match `/^[1-8]$/`. Only one of your own entries per program. Same rules as before, with clearer messages. |
| Persistence & reset | Entries are saved in localStorage under `acl-service-hours-v1`. Reset data restores `seed` after you confirm. |
