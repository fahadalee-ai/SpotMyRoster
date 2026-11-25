# Gaps and questions

The `.fig` file was read locally. It does not include Dev Mode inspect values (padding, radius, type size, color styles) as text, and it does not include prototype connectors. Those cannot be copied exactly until the file is opened in Figma with edit access or an exported inspect spec.

1. Node IDs for Athlete frames were not recoverable. Inventory uses frame names only.
2. Tactic Sans is named in the file (`TacticSans-BlkIt`, `TacticSans-Blk`). The font file is not in this project. The app still falls back. A licensed Tactic Sans file is needed.
3. The 94 images inside the `.fig` are stored by hash, not by layer name. They were not mapped onto teams, athletes, or events. Team and event pictures are therefore not the Figma files yet.
4. Emma Davis appears on Coach “View Athlete”, not as a full parent-profile form. Recovered text is name, U14, Baseball, Charlotte, NC, 92% Match, and parent Sarah Davis. School, jersey, height, stats, and photo were not tied to her name in the file text, so they were not filled in.
5. Two different bottom nav sets appear (Dashboard / Discover / My Opportunities / Saved, and Tournaments / Saved / Calendar / Messages / My Athlete / Subscription). The file does not say which one is the phone tab bar. The app still uses Home, Teams, Events, Learn, Chat.
6. No Learn, Splash, or Onboarding frame was found in this Athlete flow. The Learn section already in the app came from the earlier written brief, not from these frames.
7. Add Athlete and Edit Athlete field lists are only partly visible (first name, last name, primary position, secondary position, skill level, jersey number, primary position value Pitcher). Dropdown option lists and error messages were not in the text layer dump.
8. “24 trainings” is the count on the Trainings frame. Only six training names were recovered, so the list is shorter than the design.
9. The lightning-bolt mark used on the website was not a named export in this file. The Premium box uses a bolt icon from the icon set until the website asset is provided.
10. Payment text in Figma describes a real charge. This build does not send a card or store a card number.
11. www.spotmyroster.com was not used to fill gaps, because Figma wins and the missing pieces are visual specs, not extra copy.
