# ️ Upcoming Enhancements & Host Experience (Mobile + PC)

- **Dual Host Control**
  - Host can join via *mobile* to see what players see.
  - Host can also join via *PC* with advanced controls:
    - View all questions/answers
    - Mark answers as right/or wrong
    - Add/remove strikes
    - Manually control scores
    - Reveal clubs/logos (REMO)
    - Move to next question or segment
    - Lock inputs after bell click
    - Flexible host control over game state

- **Segment-Specific Behavior**
  - **BELLJ** and **SING**:
    - Question hidden from players.
    - Players race to click a shared "bell" button.
    - First click disables bell for second player.
    - Host sees who clicked first, acts on their answer.
    - If incorrect, control passes to second player; else question is void.
    - Host picks correct/incorrect via ui.

- **REMO** Logic:
  - Host clicks to reveal club logos step-by.s

- **Pre-Game Lobby Settings**
  - Host PC lobby view:
    - Set number of questions per segment
    - [Suggestions]: choose enabled segments, customize team logos, toggle special buttons)
  - Mobile lobby view:
    = Confirm theme; wait for host to start the game

- **Special Button Logic**
  - Special buttons (LOCK_BUTTON, TRAVELER_BUTTON, PIT_BUTTON) can each be used *once per player**.
  - After use, button is hidden/disabled.
  
- **Responsive Layout (Mobile Support)**
  - Ensure full gameplay fits within [iPhone 13 Pro] viewport.
  - Layout suggestion:
    - Pyramid format: Host top-center, Players bottom-left/right.
    - Show strike count, round/total score, special button status.
    - Avoid scroll; prioritize camera, scores, question visibility.
