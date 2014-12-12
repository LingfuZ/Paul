/**
* A simple platform game inspired by Dark Blue - Thomas Palef
*
* @author lf.zhang86@gmail.com (Lingfu Zhang)
* Copyright (c) 2014 Lingfu Zhang
* The MIT License (MIT)
*/

/**
* Create Level Object according to the level plan
* @param {array} plan - The level plan
* @constructor
*/
function Level(plan) {
  var x, y, line, row, type;

  this.width = plan[0].length;
  this.height = plan.length;
  this.layout = [];
  this.actors = [];
  this.coinTotal = 0;
  this.coinCollected = 0;

  for (y = 0; y < this.height; y++) {
    line = plan[y];
    row = [];
    for (x = 0; x < this.width; x++) {
      character = line[x];
      Actor = actorSymbols[character];
      if (Actor) {
        if (Actor === Coin) {
          this.coinTotal++;
        }
        this.actors.push(new Actor(new Vector(x, y), character));
      }
      if (character === 'x') {
        type = 'wall';
      }
      if (character === '!') {
        type = 'lava';
      }
      if (character === ' ') {
        type = 'space';
      }
      row.push(type);
    }
    this.layout.push(row);
  }

  this.player = this.actors.filter(function (actor) {
    return actor.type === 'player';
  });

  this.status = this.finishDelay = null;
}

/**
* Check if actor collide with wall or lava
* @param {Vector} position The position of actor
* @param {Vector} size The size of actor
*
* @reutrn Returns a string of what type of element had collide with
*                 or null
*/
Level.prototype.collideWith = function (position, size) {

  var top = Math.ceil(position.y + size.y);
  var bottom = Math.floor(position.y);
  var left = Math.floor(position.x);
  var right = Math.ceil(position.x + size.x);
  var x, y, result;

  if (left < 0 || right > this.width || top < 0) {
    return 'wall';
  }
  if (bottom > this.height) {
    return 'lava';
  }

  for (y = bottom; y < top; y++) {
    for (x = left; x < right; x++) {
      if (this.outOfBound(y, x)) {
        // TODO: Should throws an exeception here
        return null;
      }
      result = this.layout[y][x];
      if (result !== 'space') {
        return result;
      }
    }
  }

}

/**
* Check if the index for layout out of bound
* @param {number} y - The row index
* @param {number} x - The column index
*
* @return Returns a boolean 
*/
Level.prototype.outOfBound = function (y, x) {

  if (x >= this.width || y >= this.height || y < 0 || x < 0) {
    return true;
  }
  return false;

}

/**
* Check if two actor are overlapped with each other
* @param {object} actor - Player or Lava or Coin
* @param {object} other - Player or Lava or Coin
*
* @return Returns a boolean
*/
function isOverlapped(actor, other) {

  return actor.position.x + actor.size.x > other.position.x &&
        actor.position.x < other.position.x + other.size.x &&
        actor.position.y + actor.size.y > other.position.y &&
        actor.position.y < other.position.y + other.size.y;

}

/**
* Check if player touches another actor
* @param {Player} player - Paul
*/
Level.prototype.interactWith = function (player) {

  var i = 0,
      otherActor;
  for (i, otherActor; otherActor = this.actors[i]; i++) {
    if (otherActor !== player) {
      if (isOverlapped(player, otherActor)) {
        return otherActor;
      }
    }
  }

}

Level.prototype.resultOf = function (eventType, event) {

  if (eventType === 'lava' && this.status === null) {
    this.status = 'lost';
  }
  if (eventType === 'coin') {
    this.coinCollected++;
    this.removeActor(event);
    if (this.coinCollected === this.coinTotal) {
      this.status = 'won';
    }
  }

}

Level.prototype.removeActor = function (actor) {

  this.actors = this.actors.filter(function (other) {
    if (other !== actor) {
      return other;
    }
  });

}

Level.prototype.enableActors = function (step, keys) {
  this.actors.forEach(function (actor) {
    actor.act(step, this, keys);
  }, this);
}

Level.prototype.isFinished = function() {
  return this.status !== null;
}

/**
* @override
*/
Level.prototype.toString = function () {

  var result = '';
  this.layout.forEach(function (row) {
    row.forEach(function (item) {
      if (item === 'wall') {
        result += '#';
      }
      if (item === 'lava') {
        result += '!';
      }
      if (item === 'space') {
        result += ' ';
      }
    });
    result += '\n';
  });
  return result;

}

/**
* Ceate a vector value
* @param {number} x - A floating point number
* @param {number} y - A floating point number
* @constructor
*/
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function (other) {

  return new Vector(this.x + other.x, this.y + other.y);

}

Vector.prototype.multiply = function (multiplier) {

  return new Vector(this.x * multiplier, this.y * multiplier);

}

function Player(position) {

  var width = 0.7;
  var height = 1.2;
  var offsetY = new Vector(0, -(height - 1));
  this.position = position.add(offsetY);
  this.size = new Vector(width, height);
  this.speed = new Vector(0, 0);

}

Player.prototype.type = 'player';

var walkSpeed = 4;

/**
* Enable player to walk in the game
* @param {number} step - Represents time duration for each frame
* @param {Level} level - The current level object
* @param {object} keys - The pressed keys
*/
Player.prototype.walk = function (step, level, keys) {

  if (keys.left) {
    this.speed.x = -walkSpeed;
  } else {
    this.speed.x = walkSpeed;
  }

  var movement = new Vector(this.speed.x * step, 0);
  var newPosition = this.position.add(movement);
  var collision = level.collideWith(newPosition, this.size);

  if (collision) {
    level.resultOf(collision);
  } else {
    this.position = newPosition;
  }

}

var bounce = 0.2;
var speedY = -10;

/**
* Set initial speed for player's jump
*/
Player.prototype.jump = function (step, level, gravity) {

    this.speed.y = speedY;

}

Player.prototype.setPosition = function (newPosition) {

  this.position = newPosition;

}

var gravity = 20;

/**
* Apply gravitational force on Player
* @param {number} step - Represents time duration for each frame
* @param {Level} level - The current level object
* @param {object} keys - The pressed keys
*
* @return Returns the new position of Player
*/
Player.prototype.applyGravity = function (step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPosition = this.position.add(motion);
  var collision = level.collideWith(newPosition, this.size);
  if (collision) {
    level.resultOf(collision);
    if (keys.up && this.speed.y > 0) {
      this.jump();
    }
  } else {
    this.setPosition(newPosition);
  }
}

/**
* Enable player's behavior
* @param {number} step - Represents time duration of each frame
* @param {Level} level - The current level object
* @param {object} keys - The pressed keys
*/
Player.prototype.act = function (step, level, keys) {

  if (keys.left || keys.right) {
    this.walk(step, level, keys);
  }

  this.applyGravity(step, level, keys);

  var interaction = level.interactWith(this);
  if (interaction) {
    level.resultOf(interaction.type, interaction);
  }

}

function Lava(position, character) {

  this.position = position;
  this.size = new Vector(1, 1);
  if (character === '-') {
    this.speed = new Vector(2, 0);
  }
  if (character === '|') {
    this.speed = new Vector(0, 2);
  }

}

Lava.prototype.type = 'lava';

Lava.prototype.act = function (step, level) {

  var movement = this.speed.multiply(step);
  var newPosition = this.position.add(movement);
  var collision = level.collideWith(newPosition, this.size);
  if (!collision) {
    this.position = newPosition;
  } else {
    this.speed = this.speed.multiply(-1);
  }

}

function Coin(position) {

  this.position = position;
  this.size = new Vector(1, 1);

}

Coin.prototype.type = 'coin';

Coin.prototype.act = function (step) {

}

/**
* Create a specific type of HTML element identified by tag name 
* and with optional class
* @param {string} tagName The name of HTML element type
* @param {string} classname The name of class for the HTML element
*
* @return Returns the HTML element just created
*/
function createElement(tagName, className) {

  var element = document.createElement(tagName);
  if (className)  {
    element.className = className;
  }
  return element;

}

/**
* Create the view of game
* @param {Element} parent The parent HTML element of the game
* @param {Level} level The level object contains the current level plan
* @constructor
*/
function View(parent, level) {

  this.container = parent.appendChild(createElement('div', 'game'));
  this.level = level;

  this.container.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();

}

var scale = 20;

/**
* Render game's background in view according to the level layout
* @return Returns the table element contains the game background
*/
View.prototype.drawBackground = function () {

  var table = createElement('table', 'background');
  table.style.width = this.level.width * scale + 'px';
  this.level.layout.forEach(function (row) {
    var tableRow = table.appendChild(createElement('tr'));
    tableRow.style.height = scale + 'px';
    row.forEach(function (type) {
      tableRow.appendChild(createElement('td', type));
    });
  });
  return table;

}

/**
* Render and update the layer of actors
*/
View.prototype.drawFrame = function () {

  if (this.actorLayer) {
    this.container.removeChild(this.actorLayer);
  }
  this.actorLayer = this.container.appendChild(this.drawActors());
  this.container.className = 'game ' + (this.level.status || '');

}

/**
* Draw the layer of actors in view
* @return Returns the HTML element contains the actors layer
*/
View.prototype.drawActors = function () {

  var container = createElement('div', 'actors');
  this.level.actors.forEach(function (actor) {
    var actorElement = container.appendChild(createElement('div', 
                                                  'actor ' + actor.type));
    actorElement.style.width = actor.size.x * scale + 'px';
    actorElement.style.height = actor.size.y * scale + 'px';
    actorElement.style.left = actor.position.x * scale + 'px';
    actorElement.style.top = actor.position.y * scale + 'px';
  });
  return container;

}

View.prototype.clear = function () {
  
    this.container.parentNode.removeChild(this.container);

}

/**
* Return an array representing which key has been pressed.
* @param {Object} codes A object contains relates keycodes to names
* 
* @return {Object} Returns a object contains key names 
*                  and whether the key is pressed
*/
function trackKeys(codes) {

  var pressed = Object.create(null);
  function handler(event) {

    if (codes.hasOwnProperty(event.keyCode)) {
      var isPressed;
      if (event.type === 'keydown') {
        isPressed = true;
      } else {
        isPressed = false;
      }
      pressed[codes[event.keyCode]] = isPressed;
    }

  }

  addEventListener('keydown', handler);
  addEventListener('keyup', handler);
  return pressed;

}
/**
* Enable all game mechanics through animation
* @param {object} createFrame - A function controls game mechanics
*/
function enableGameplay(createFrame) {

  var lastTime = null;
  function frame(time) {

    if (lastTime !== null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      createFrame(timeStep);
    }
    lastTime = time;
    requestAnimationFrame(frame);

  }

  requestAnimationFrame(frame);

}

function resetGame(plan, view, ViewEngine) {

  view.clear();
  startGame(plan, ViewEngine);

}

/**
* Initiate the game
* @param {array} plan - An array of strings represent game's layout
* @param {string} ViewEngine - The name of object construct the view
*/
function startGame(plan, ViewEngine) {

  var level = new Level(plan);
  var parent = document.body.getElementsByClassName('game-wrapper')[0];
  var view = new ViewEngine(parent, level);
  enableGameplay(function (step) {

    level.enableActors(step, pressedKeys);
    view.drawFrame(step);

    if (level.isFinished()) {
      resetGame(plan, view, ViewEngine);
    }
  });

}