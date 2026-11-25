# Athlete screen inventory

Source: local file `Spot my roster Coach dashboard 0.2 (1).fig`, exported 2026-11-25. Frame names were read from the file. Figma node IDs, auto-layout numbers, and prototype links are not stored as readable text in this `.fig` archive, so those columns are marked unknown.

Coach frames are listed only when they contain the athlete name Emma Davis. They are out of scope for this app.

| Screen name in Figma | Purpose | In the app | Notes |
| --- | --- | --- | --- |
| Parent Athlete - Premium / login | Sign in, role Parent/Athlete vs Coach | Partial `/login` | Tagline in Figma: UNLEASH YOUR ATHLETE'S POTENTIAL. |
| Parent Athlete - free / login | Same login, free state | Partial `/login` | |
| Parent Athlete - Premium / Create account | Create Parent Account | Partial `/register` | |
| Parent Athlete - Premium / Create account Step 01 | Tell Us About Your Athlete | Partial `/setup` | Fields: ATHLETE FIRST NAME, ATHLETE LAST NAME, PRIMARY POSITION, SECONDARY POSITION (OPTIONAL), SKILL LEVEL |
| Parent Athlete - Premium / Create account Step 02 | Account created | Partial `/auth-success` | Welcome to the Elite. Welcome to SpotMyRoster, Jordan. |
| Parent Athlete - free / Create account | Free signup | Partial `/register` | |
| Parent Athlete - free /Create account Step 1 | Free athlete step | Partial `/setup` | |
| Parent Athlete - free /Create account Step 2 | Free account created | Partial `/auth-success` | |
| Parent Athlete - free /Account Created! | Success | Partial `/auth-success` | |
| Parent Athlete - Premium /Home Dashboard | Home, search, premium | Partial `/home` | Search placeholder: Search tryouts, teams, tournaments, or trainers |
| Parent Athlete - free /Parent/Athlete | Free home | Partial `/home` | Nav words seen: Dashboard, Discover, My Opportunities, Saved |
| Parent Athlete - Premium /Discover View | Everything open near you | Partial `/discover` | Within 15 miles of Oakland |
| Parent Athlete - Premium /Baseball View | Baseball | Missing as its own screen | Find teams, tryouts, players and opportunities near you. Recommended for Emma |
| Parent Athlete - Premium /Baseball Tryouts View | Baseball Tryouts | Partial `/events` | 1 result within 10 miles of Oakland, CA. |
| Parent Athlete - Premium /Baseball Tryouts Detail View | Tryout detail | Partial `/events/$eventId` | Featured badge. Oakland, CA. Pitcher / Outfield |
| Parent Athlete - Premium /Baseball Tryouts Detail Inquiry | Inquiry | Partial apply flow | |
| Parent Athlete - Premium /Register / Inquire View | Register / Inquire | Partial | |
| Parent Athlete - free /Tryouts/opportunities | Tryouts | Partial `/events` | |
| Parent Athlete - free /View details | Detail | Partial | |
| Parent Athlete - free /Browse Team | Browse team | Partial `/teams` | |
| Find a team View | Find a team | Partial `/teams` and `/discover` | Cards: Northstar United, Lake Union Juniors, Rain City Select |
| Find a team View details | Team detail | Partial `/teams/$teamId` | |
| Find a team Contact coach | Contact coach | Partial `/chat` | |
| Find a team filter View | Filters | Partial team filter sheet | Labels seen: Sport, Any spot |
| Find a team / Tournaments | Tournaments | Partial `/tournaments` | |
| Parent Athlete - Premium /My Opportunities View | Registrations & inquiries | Partial `/opportunities` | |
| Parent Athlete - Premium /Saved View | Saved | Partial `/saved` | |
| Parent Athlete - Premium /Messages | Messages | Partial `/chat` | Premium-locked until upgrade |
| Dashboard / Calendar | Tryout & Opportunity Calendar | Partial `/events` calendar | September 2026 appears in the file |
| Parent Athlete - free /Trainings | Available trainings | Partial `/trainings` | 24 trainings, near Oakland, CA |
| Parent Athlete - Premium /Add athlete | Add athlete | Partial `/account/athletes` | Not the full Figma form |
| Parent Athlete - Premium /Edit athlete | Edit athlete | Partial `/profile/edit` | Labels seen: jersey number, primary position, Pitcher, Batting Stats, Pitching Stats |
| Dashboard / My athlete | My athlete | Partial `/profile` | |
| Stats screens | Soccer, Basketball, Volleyball, Baseball batting/pitching/fielding, Hockey, ice hockey, Tennis, Swimming, Football, Track & Field, Lacrosse | Partial `/profile/stats` | App stats cover five sports only |
| Parent Athlete - Premium /Subscription | Premium Plan, $9.99 yearly | Partial `/subscription` | |
| Subscription Upgrade View | Upgrade to Parent Premium | Partial `/subscription/upgrade` | |
| payment-details | Card payment | Partial `/subscription/payment` | No real charge |
| payment-Success | Success | Partial `/subscription/success` | |
| Emma Davis (Coach View Athlete) | Reference profile | Partial `/profile/emma` | See data extract. Full layout is not in the parent frames |

No frame named Learn, Splash, or Onboarding was found in this Athlete flow.
