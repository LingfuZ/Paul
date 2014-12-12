// Testing ------------------------------------------------------
var simpleLevelPlan = [
"                       ",
"                       ",
" x $ x            - x  ",
"             $ $    x  ",
"     @      xxxxx   x  ",
" xxxxxxx            x  ",
" xxxxxxx!!!!!!!!!!!!x  ",
" xxxxxxxxxxxxxxxxxxxx  ",
"                       "
];

var actorSymbols = {
  '@': Player,
  '$': Coin,
  '-': Lava,
  '|': Lava
};

var keyCodes = {37: 'left', 38: 'up', 39: 'right', '40': 'down'};
var pressedKeys = trackKeys(keyCodes);

startGame(simpleLevelPlan, View);