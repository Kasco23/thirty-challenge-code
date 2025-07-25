# CHANGELOGM

``chore:create initial CHANGELOG.md with recent updates`
``f
- Added `sanity.txt` to test direct commit functionality
- Expanded `PROJECT_OVERVIEW.md` and `QUIV_STRUCTURENg with new multi-device host control features, bell segment lockout rules, REMO logo reveal, and lobby
- Installed `flag-icons` and imported in `main.tsx`
- Committed asset updates: national flags, club logos
- Updated `Join.tsx` page with: input for name, club logo, select flag using flag-icons SGV, navigates to room with query params

````

### July 25, 2025

- Setup `Join.tsx` to let players choose their name, flag, and club before joining the quiz room
- Support video and visible identity in the room
- Make flag selection and club logo selection searchable
- Added flag-icons package and imported to `main.tsx`
- Configured video style and layout for mobile to fit triangle responsive to the host
- Started lobby design with video hangout screen
- Decoding scheme: connect from mobile and pc to launch quiz modes

---

\nNext up: implement lobby design views, added start button (host only), video element in lobby
- Send to room with player name and selected avatars
- Refactored video positioning on mobile layout

--
