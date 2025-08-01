#################################################################
# 1) Segments (run in this order)
#################################################################
SEGMENTS = {
  "{وش تعرف}":   { "code": "WSHA",  "max_q": {Q_WSHA_T3ARAF}  },
  "{المزاد}":     { "code": "AUCT",  "max_q": {Q_AUCTION}      },
  "{فقرة الجرس}": { "code": "BELL",  "max_q": {Q_BELL}        },
  "{سين & جيم}":  { "code": "SING",  "max_q": {Q_SIN_JEEM}    },
  "{التعويض}":    { "code": "REMO",  "max_q": {Q_REMONTTADA}  }
}

#################################################################
# 2) Global scoring rules
#################################################################
• Correct answer → +1 point  
• “Clean exit” (no Strike received during a question) → +2 bonus points  
• Repeating an answer or interrupting an opponent = 1 Strike  
• Three Strikes in the same question *or* failing a segment‑specific quota → the point goes to the opponent  

#################################################################
# 3) Segment‑specific mechanics
#################################################################
### 3‑A) {وش تعرف}  (code: WSHA)
  • Alternating list: Player A, Player B, … until a total of 3 Strikes occur.  
  • Each wrong or repeated item = 1 Strike to the player who said it.  
  • If a player survives a full question with 0 Strikes, apply the +2 bonus.

### 3‑B) {المزاد}  (code: AUCT)
  • Players bid how many items they can name.  
  • Highest bidder answers alone.  
  • They must deliver **≥ 50 %** of their promised count.  
        – Meeting the quota: +1 per correct item.  
        – Delivering < 50 %: ‑1 to bidder, +1 to opponent.  
  • Reaching 40 points *within this segment* unlocks a one‑time **{LOCK_BUTTON}**:  
        – Call the button before answering to make the question exclusive.  
        – Failure does not deduct points but consumes the button.

### 3‑C) {فقرة الجرس}  (code: BELL)
  • Fast‑buzzer questions; first to hit the buzzer answers.  
  • Each player has one **{TRAVELER_BUTTON}** they can shout *before* a question is read:  
        – Secures the question exclusively for them.  
        – If the answer is wrong, the point is automatically awarded to the opponent.  
  • No Strikes here—one wrong ends the question.

### 3‑D) {سين & جيم}  (code: SING)
  • Four tough trivia questions by default.  
  • Each player owns one **{PIT_BUTTON}**:  
        – Declare it before the question.  
        – Correct answer: +2 to you *and* ‑2 to opponent.  
        – Wrong answer: no score change, button is lost.  
  • Normal answers (without PIT) follow global scoring (+1 / Strike).

### 3‑E) {التعويض}  (code: REMO)
  • Designed for a late comeback—often “Guess the career” clues.  
  • Host reads each clue; first correct guess gets the point.  
  • Wrong guesses don’t give Strikes but delay the next clue.
