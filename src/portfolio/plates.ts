/* ASCII plates for the proof sheets. Swap these for screenshots later if you like. */
export const plates: Record<string, string> = {
  journal: String.raw`
     _______________________
    /   oct 09        ✳   /|
   /  dear diary,        / |
  /   today i built     /  |
 /    a thing that     /   |
/____ writes back.____/    |
|  ~~~~~~   ~~~~~~~   |    /
|  ~~~~   ~~~~~~~~~   |   /
|  ~~~~~~~~   ~~~~    |  /
|_____________________| /
'---------------------'`,
  cards: String.raw`
   .------.      .------.
   |A     |.------.     |
   |  /\  ||K     |  ♡  |
   | (  ) ||  ♛   |     |
   |  \/  ||      |    Q|
   |     A||  VS  |-----'
   '------'|     K|
           '------'
   [ you ]  3 : 2  [ the house ]`,
  graph: String.raw`
        (arrays)
        /      \
   (hashing)  (two ptr)
      |    \    /   |
   (trees)--(graphs)(dp)
      |        |     \
   (heaps)  (bfs/dfs) (★)
      \______/
     day 041  ▮▮▮▮▮▯▯ streak`,
  twin: String.raw`
     .-""-.        .-""-.
    / o  o \  <->  / ◉  ◉ \
    |  __  |       |  ==  |
     \____/  sync   \____/
      |  |  ~~~~~~   |  |
     /    \  learn  /    \
     you          your twin`,
  calendar: String.raw`
   ┌──────── OCTOBER ────────┐
   │ m  t  w  t  f  s  s     │
   │       1  2  3  4  5     │
   │ 6  7 [8][9]10 11 12     │
   │13 14 15 16 17 18 19     │
   │20 21 22 23 24 25 26     │
   └─────────────────────────┘
     leave: approved  ✓`,
  quiz: String.raw`
      ______________
     |  question 7  |
     |   ? ? ? ? ?  |
     |______________|
      (a) (b) (c) (d)
           ^
       correct! +10
      ▮▮▮▮▮▮▮▯▯▯ 70%`,
}
