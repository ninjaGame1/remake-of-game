  var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var respawn = 0;

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_GAMEWIN = 3;

var gameState = STATE_SPLASH;

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;


var LAYER_OBJECT_TRIGGERS = 3;
var LAYER_OBJECT_COINS= 4;
<<<<<<< HEAD
var LAYER_OBJECT_ENEMIES = 5;

=======
var LAYER_OBJECT_CHECKPOINTS = 5;
>>>>>>> origin/master
var coins = [];
var enemies = [];

var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;



//size of map in tiles
var MAP = {tw:100, th:15};
//size of each tile in pixels
var TILE = 35;
var TILESET_TILE=TILE*2;
var TILESET_PADDING=2;
var TILESET_SPACING=2;
var TILESET_COUNT_X=14;
var TILESET_COUNT_Y=14;

//physics definitions
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
// max movement on x axis=10 meters
var MAXDX = METER * 10;
// max movement on y axis= 15 meters
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 1500;

//sound
var musicBackground;
var sfxFire;

// load an image to draw
var position = new Vector2();
var player = new Player();
var enemy = new Enemy();
var keyboard = new keyboard();

var score = 0;
var lives = 3;

//loading image
var tileset = document.createElement("img");
tileset.src = "tileset.png";

var heartImage = document.createElement("img");
heartImage.src = "heartImage.png";
//helper functions

function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>= MAP.tw || ty<0)
		return 1;
	// let player drop off the bottom of the screen (death)
	if(ty>= MAP.th)
		return 0;
	return cells[layer][ty][tx];
};

function cellAtPixelCoord(layer, x, y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
		return 1;
	//let player drop off the bottom of the screen (death)
	if(y>SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function tileToPixel(tile)
{
	return tile * TILE;
};

function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
}

function drawMap()
{
	var startX = -1;
	var maxTiles = Math.floor(SCREEN_WIDTH/TILE)+ 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE +Math.floor(player.position.x%TILE);

	startX = tileX - Math.floor(maxTiles/ 2);

	if(startX < -1)
	{
		startX= 0;
		offsetX = 0;
	}
	if(startX > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}

	worldOffsetX = startX * TILE + offsetX;

	for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
	{
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			var idx = y * level1.layers[layerIdx].width + startX;
			for( var x = startX; x < startX + maxTiles; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
					// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
					// so subtract one from the tileset id to get the correct tile
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
						(TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
						(TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
					(x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}

	context.fillStyle = "yellow";
	context.font="32px Arial";
	var scoreText = "Score: " + score;
	context.fillText(scoreText, SCREEN_WIDTH - 170, 35);

	// life counter
	for(var i=0; i<lives; i++)
	{
		context.drawImage(heartImage, 5 + ((heartImage.width/ 4)*i), 1);
	}
}

var cells = []
function initialize() 
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
	{ // initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) 
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++) 
			{
				if(level1.layers[layerIdx].data[idx] != 0) 
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1) 
				{
						// if we haven't set this cell's value, then set it to 0 now
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
	//trigger layer in collision map - for the door to finish the game
	cells[LAYER_OBJECT_CHECKPOINTS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_CHECKPOINTS].height; y++)
	{
		cells[LAYER_OBJECT_CHECKPOINTS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_CHECKPOINTS].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_CHECKPOINTS].data[idx] != 0)
			{
				cells[LAYER_OBJECT_CHECKPOINTS][y][x] = 1;
				cells[LAYER_OBJECT_CHECKPOINTS][y-1][x] = 1;
				cells[LAYER_OBJECT_CHECKPOINTS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_CHECKPOINTS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_CHECKPOINTS][y][x] != 1)
			{
				cells[LAYER_OBJECT_CHECKPOINTS][y][x] = 0;
			}
			idx++;
		}
	}
    cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++)
	{
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0)
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1)
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
<<<<<<< HEAD
	//add enemies
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++)
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0)
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
			idx++;
		}
	}
	
	for( var i = 0; i < enemies.length; i++ )
    {
        for( var j = 0; j < enemies.length; j++)
        {
            if(enemies[i].position.x == enemies[j].position.x && enemies[i].position.y == enemies[j].position.y)
            {
            enemies.splice(i, 1)
            }
        }
    }
=======
    
>>>>>>> origin/master
	//add coins
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_COINS].height; y++)
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_COINS].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_COINS].data[idx] != 0)
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var c = new Coin(px, py);
				coins.push(c);
			}
			idx++;
		}
	}
	musicBackground = new Howl(
	{
		urls: ["background.ogg"],
		loop: true,
		buffer: true,
		volume: 0.5
	} );
	musicBackground.play();

	sfxFire = new Howl(
	{
		urls: ["coin.ogg"],
		buffer: true,
		volume: 1,
		onend: function() {
			isSfxPlaying = false;
		}
	} );
}

function intersects (x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 ||
		x2 + w2 < x1 ||
		x2 > x1 + w1 ||
		y2 > y1 + h1)
	{
		return false;
	}
	return true;
}


var water = document.createElement("img");
water.src = "water.png";

var firstbackground = [];

for(var y=0;y<15;y++)
{
	firstbackground[y] = [];
	for(var x=0; x<20; x++)
		firstbackground[y][x] = water;
}
var splashTimer = 3
function runSplash(deltaTime)
{
	splashTimer -= deltaTime;
	if(splashTimer <= 0)
	{
		gameState = STATE_GAME;
		return;
	}
	for(var y=0; y<15; y++)
		{
			for(var x=0; x<20; x++)
			{
				context.drawImage(firstbackground[y][x], x*32, y*32);
			}
		}
	context.fillStyle = "#000";
	context.font="40px Arial";
	context.fillText("Get Ready", 220, 240);
}

function runGame(deltaTime)
{
	player.update(deltaTime);

	for(var i=0; i<coins.length; i++)
	{
		coins[i].update(deltaTime);
	}

		//add score
		for(var i=0; i<coins.length; i++)
		{
			if(intersects(coins[i].position.x, coins[i].position.y, TILE, TILE,
					player.position.x, player.position.y, player.width/2, player.height/2)== true)
			{
				sfxFire.play();
				score += 1;
				coins.splice(i, 1);
				break;
			}
		}

	var hit=false;
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].update(deltaTime);
		if( bullets[i].position.x - worldOffsetX < 0 ||
			bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
		{
			hit = true;
		}

		for(var j=0; j<enemies.length; j++)
		{
			if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
				enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
			{
				// kill both the bullet and the enemy
				enemies.splice(j, 1);
				hit = true;
				// increment the player score
				score += 1;
				break;
			}
		}
		if(hit == true)
		{
			bullets.splice(i, 1);
			break;
		}
	}
	//DRAW
	drawMap();
	player.draw();
	
	for(var i=0; i<coins.length; i++)
	{
		coins[i].draw(deltaTime);
	}

	//set lives
	var respawnTimer = 1;
	
	if(player.isDead == false)
	{
		if(player.position.y > SCREEN_HEIGHT)
		{
				player.isDead == true;
				lives -= 1;
				player.position.set(1*35, 10*35);
		}
		if(lives == 0)
		{
			gameState = STATE_GAMEOVER;
			return;
		}		
	}
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
	
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}

var endTimer = 5
function runGameOver(deltaTime, x, y)
{
	for(var y=0; y<15; y++)
		{
			for(var x=0; x<20; x++)
			{
				context.drawImage(firstbackground[y][x], x*32, y*32);
			}
		}
	context.fillStyle = "#F20C0C";
	context.font = "45px Arial";
	context.fillText("GAME OVER", 230, 250);

	context.fillStyle = "#F20C0C";
	context.font = "20px Arial";
	context.fillText("Score: " + score, 290, 290);
}

function runGameWin(deltaTime, x, y)
{
	endTimer -= deltaTime
	for(var y=0; y<15; y++)
		{
			for(var x=0; x<20; x++)
			{
				context.drawImage(firstbackground[y][x], x*32, y*32);
			}
		}
	context.fillStyle = "#F20C0C";
	context.font = "45px Arial";
	context.fillText("YOU WIN", 230, 250);

	context.fillStyle = "#F20C0C";
	context.font = "20px Arial";
	context.fillText("Score: " + score, 290, 290);
}

function run()
{
    
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();

	switch (gameState)
	{
		case STATE_SPLASH:
				runSplash(deltaTime);
				break;
		case STATE_GAME:
				runGame(deltaTime);
				break;
		case STATE_GAMEOVER:
				runGameOver(deltaTime);
				break;
		case STATE_GAMEWIN:
				runGameWin(deltaTime);
				break;
	}
}

initialize();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
