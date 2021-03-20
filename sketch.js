//global vars
var floorPos_y;
var currentGround;
var scrollPos;
var heightPos;
var currentLevel;
var NESfont;
var carrotCollectedSound;
var gameLoopSound

function preload()
{
	NESfont = loadFont('assets/fonts/NESfont.ttf')
	
	carrotCollectedSound = loadSound('assets/sounds/carrotCollected.mp3')
	lifeCollectedSound = loadSound('assets/sounds/heartCollected.mp3')
	gameLoopSound = loadSound('assets/sounds/gameLoop.wav')

}

function setup()
{
	currentLevel = 0
	createCanvas(windowWidth, windowHeight);
	resizeCanvasData.currentWidth = windowWidth
	resizeCanvasData.currentHeight = windowHeight
	resizeCanvasData.yCanvasTranslate = 0
	resizeCanvasData.yObjStart = (resizeCanvasData.currentHeight * 3/4) - 432
	messages.updateMessageDimensions()
	floorPos_y = height * 3/4;
	statsBoard.updateTotals()
	updateYObjStart()

	startGame();
	
}

function startGame()
{

	rabbitCharacter.setCharData()
	
	respawn()
	
	carrots.carrotArray = [];
	lives.heartsArray = [];
	clouds.cloudsArray = [];
	canyons.canyonsArray = [];
	enemies.enemiesArray = [];
	foxes.caves = [];
	statsBoard.score = 0;
	statsBoard.lives.current = 1;
	statsBoard.enemies.totalKilled = 0;
	statsBoard.carrots.totalCollected = 0;

	frameRate(120)

	updateCanvasData()

	statsBoard.updateCurrentLevel()

	level = levels[currentLevel]

	scrollPos = level.characterXStartScrollPos;
	heightPos = level.characterYStartHeightPos;
	

	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;
	foxes.addCaves(level.cavesData)

	skyColor = color(level.skyColor);
	carrots.setCarrotColors(color(level.carrotColor), color(level.carrotStemColor),)
	carrotsArray = level.carrotPositionsArray
	carrots.addCarrots(carrotsArray)
	lives.color = color(level.livesColor)
	heartsArray = level.heartPositionsArray
	lives.addHearts(heartsArray)
	currentGround = drawTerrain.generateLayeredGround(color(level.grassLight),
								color(level.grassDark),
								color(level.dirtLight),
								color(level.dirtDark),
								color(level.bedRockLight),
								color(level.bedRockDark),
								floorPos_y,
								level.groundPositionsArray);
	platformsData = level.platformPositionsArray
	currentPlatforms = drawTerrain.generateLayeredPlatforms(color(level.platformGrassLight),
								color(level.platformGrassDark),
								color(level.platformDirtLight),
								color(level.platformDirtDark),
								color(level.platformBedRockLight),
								color(level.platformBedRockDark),
								platformsData)
	clouds.addClouds(level.cloudPositionsArray)
	mountains.mountainColors = {sideMountains: color(level.sideMountainsColor), middleMountain: color(level.middleMountainColor), river: color(level.riverColor), snowCap: color(level.snowCapColor)}
	mountains.mountainIndcies = level.mountainPositionsArray
	trees.treeColors = {leaves: color(level.leavesColor), trunk: color(level.trunkColor)}
	trees.treeIndicies = level.treePositionsArray
	canyons.addCanyons(level.canyonPositionsArray)
	canyons.color = color(level.canyonColor)
	enemies.enemyColors = {hatTop: color(level.hatTopColor),
		hatBottom: color(level.hatBottomColor),
		gunTop: color(level.gunTopColor),
		gunBottom: color(level.gunBottomColor),
		innerFoot: color(level.innerFootColor),
		outerFoot: color(level.outerFootColor),
		body: color(level.bodyColor),
		face: color(level.faceColor),
		bulletColor: color(level.bulletColor)}
	enemiesArray = level.enemyPositionsArray
	enemies.addEnemies(enemiesArray)
	child.setChildDimensions(level.childXPos, level.childYPos, level.childSize)
	child.colors = {platformColor: color(level.childPlatformColor)}

}

function draw()
{
	// logFrameRate(50, 70)	
	statsBoard.handlePlayerDeath()

	push();
	translate(0, resizeCanvasData.yCanvasTranslate)

	background(levels[currentLevel].skyColor);
	push();
    translate(scrollPos, heightPos);
	mountains.drawMountains()
	trees.drawTrees()
	canyons.drawCanyons();
	drawTerrain.drawCurrentTerrain(currentGround, currentPlatforms)
	collectedAnimations.animateAnimations()
	clouds.drawClouds();
	enemies.bullets.updateExpiredBullets()
	enemies.bullets.drawBullets()
	enemies.drawEnemies()
	foxes.drawCaves()
	foxes.drawFoxes()
	foxes.updateFoxes()
	pop();

	rabbitCharacter.drawRabbit()
	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;

	//draw collectables in front of character
	push();
    translate(scrollPos, heightPos);
	carrots.drawCarrots();
	child.drawChild();
	lives.drawHearts();
	pop();

	checkOutOfBounds()

	pop();

	statsBoard.drawBoard()
	statsBoard.drawCarrotsToStats()
	statsBoard.drawHeartsToStats()
	statsBoard.drawChildrenToStats()

	animatePointsCollected.animateActiveAnimations()

	if(messages.drawMessageBool){messages.drawMessage()}

}

//objects

//--------------------HANDLES RESPAWNING (NOT DEATH)--------------------//

function respawn()
{
	scrollPos = 0;
	heightPos = 0;
	rabbitCharacter.userInput = {direction: "front", airCondition: "walking"};
	rabbitCharacter.yPos = levels[currentLevel].characterYStart;
	rabbitCharacter.xPos = levels[currentLevel].characterXStart;
	rabbitCharacter.realWorldPos = levels[currentLevel].characterXStart
	rabbitCharacter.platformData.onPlatform = false;
	rabbitCharacter.ridingCloudData.onCloud = false;

	messages.drawMessageBool = false;
	statsBoard.deathHandled = false;
	rabbitCharacter.isDead = false;

}

//--------------------CANVAS DIMENSIONS OBJECT (HANDLES RESIZING)--------------------//
resizeCanvasData = 
{
	currentWidth: null,
	currentHeight: null,
	yCanvasTranslate: null,
	yObjStart: null	
}

//--------------------CONTROLS GAME OVER WINDOW--------------------//
messages = 
{
	distFromEdgeX: null,
	distFromEdgeY: null,

	updateMessageDimensions: function ()
	{
		this.distFromEdgeX = resizeCanvasData.currentWidth * 0.2
		this.distFromEdgeY = resizeCanvasData.currentHeight * 0.2
	},
	
	drawMessageBool: false,

	onButtonColor: [216, 235, 253],

	restartDimensions: {xLeft: null, xRight: null, yTop: null, yBottom: null},

	shareDimensions: {xLeft: null, xRight: null, yTop: null, yBottom: null},


	onRestartButton: function (x, y)
	{
		xInRange = (x > this.restartDimensions.xLeft) && (x < this.restartDimensions.xRight)
		yInRange = (y > this.restartDimensions.yTop) && (y < this.restartDimensions.yBottom)

		if(xInRange && yInRange)
		{
			return true
		}
	},

	onShareButton: function (x, y)
	{
		xInRange = (x > this.shareDimensions.xLeft) && (x < this.shareDimensions.xRight)
		yInRange = (y > this.shareDimensions.yTop) && (y < this.shareDimensions.yBottom)

		if(xInRange && yInRange)
		{
			return true
		}
	},

	shareResults: function ()
	{

	},

	restartGame: function ()
	{

	},

	drawMessage: function ()
	{
		textFont(NESfont)
		//SPACING OF LINES
		fromTop = (this.distFromEdgeY)
		fromBottom = (resizeCanvasData.currentHeight - this.distFromEdgeY)
		lineSpacing = abs(fromTop - fromBottom) / 7

		fill(0, 0, 0, 200)
		rect(0, 0, resizeCanvasData.currentWidth, resizeCanvasData.currentHeight)

		fill(255);
		stroke(230);
		strokeWeight(lineSpacing / 10)
		rect(this.distFromEdgeX, this.distFromEdgeY, resizeCanvasData.currentWidth - this.distFromEdgeX * 2, resizeCanvasData.currentHeight - this.distFromEdgeY * 2, 10)
		
		noStroke();
		fill(0, 0, 0);

		//GAME OVER text
		gameOverTextSize = (resizeCanvasData.currentWidth + resizeCanvasData.currentHeight) / 35
		gameOverYPos = 
		textSize(gameOverTextSize)
		textAlign(CENTER);
		text('GAME OVER', resizeCanvasData.currentWidth/2, fromTop + lineSpacing)

		statsTextSize = (resizeCanvasData.currentWidth + resizeCanvasData.currentHeight) / 60
		textSize(statsTextSize)

		//LEFT ALIGNED TEXT
		textAlign(LEFT);
		distFromLeft = this.distFromEdgeX + 20
		text('SCORE: ' + (round(statsBoard.score / statsBoard.totalScore)) + "%", distFromLeft, fromTop + lineSpacing * 2 - (statsTextSize / 2))
		text('Carrots Collected', distFromLeft, fromTop + lineSpacing * 3 - (statsTextSize / 2))
		text('Enemies Killed', distFromLeft, fromTop + lineSpacing * 4 - (statsTextSize / 2))
		text('Hearts Left', distFromLeft, fromTop + lineSpacing * 5 - (statsTextSize / 2))
		text('Family Collected', distFromLeft, fromTop + lineSpacing * 6 - (statsTextSize / 2))

		//RIGHT ALIGNED TEXT
		textAlign(RIGHT);
		distFromRight = resizeCanvasData.currentWidth - this.distFromEdgeX - 20
		text(statsBoard.score+"/"+statsBoard.totalScore, distFromRight, fromTop + lineSpacing * 2 - (statsTextSize / 2))
		text(statsBoard.carrots.totalCollected+'/'+statsBoard.carrots.total, distFromRight, fromTop + lineSpacing * 3 - (statsTextSize / 2))
		text(statsBoard.enemies.totalKilled+'/'+statsBoard.enemies.total, distFromRight, fromTop + lineSpacing * 4 - (statsTextSize / 2))
		text(statsBoard.lives.current+'/'+statsBoard.lives.total, distFromRight, fromTop + lineSpacing * 5 - (statsTextSize / 2))
		text(currentLevel+'/'+levels.length, distFromRight, fromTop + lineSpacing * 6 - (statsTextSize / 2))

		//RESTART BUTTON
		rectWidth = lineSpacing * 3
		this.restartDimensions = {xLeft: resizeCanvasData.currentWidth/2 - (rectWidth / 2), 
								xRight: resizeCanvasData.currentWidth/2 - (rectWidth / 2) + rectWidth, 
								yTop: fromTop + lineSpacing * 5.9, 
								yBottom: fromTop + lineSpacing * 5.9 + lineSpacing}
		fillColor = 100
		if(this.onRestartButton(mouseX, mouseY))
		{
			fillColor = color(this.onButtonColor)
			cursor('pointer')
		}

		fill(fillColor);
		rect(width/2 - (rectWidth / 2), fromTop + lineSpacing * 5.9, rectWidth, lineSpacing, rectWidth / 30)
		
		textAlign(CENTER)
		fill(255, 255, 255)
		text('RESTART', resizeCanvasData.currentWidth/2, fromTop + lineSpacing * 6.6)

		//SHARE BUTTON
		rectDimensions = lineSpacing
		this.shareDimensions = {xLeft: distFromRight - rectDimensions, 
								xRight: distFromRight - rectDimensions + rectDimensions, 
								yTop: fromTop + lineSpacing * 5.9, 
								yBottom: fromTop + lineSpacing * 5.9 + rectDimensions}
		fillColor = 230
		if(this.onShareButton(mouseX, mouseY))
		{
			fillColor = color(this.onButtonColor)
			cursor('pointer')
		}
		fill(fillColor);
		rect(distFromRight - rectDimensions, fromTop + lineSpacing * 5.9, rectDimensions, rectDimensions, rectDimensions / 15)
		

		//SHARE ICON
		x = distFromRight - rectDimensions + (rectDimensions / 2)
		y = fromTop + lineSpacing * 5.95 + (lineSpacing /2)
		s = statsTextSize / 150

		push();
		translate(-71 * s,-50 * s)

		fill(255)
		noStroke();

		//top of rect
		rect(x, y, 50 * s, 15 * s)
		rect(x + (90 * s), y, 50 * s, 15 * s)
		//sides of rect
		rect(x, y, 15 * s, 140 * s)
		rect(x + (125 * s), y, 15 * s, 140 * s)
		//bottom of rect
		rect(x, y + (125 * s), 130 * s, 15 * s)
		//share bar in middle
		rect(x + (62.5 * s), y - (55 * s), 15 * s, 125 * s)

		//angled rectangles
		push();
		angleMode(DEGREES);
		translate(x + (62.5 * s), y - (55 * s));
		rotate(-45);
		rect(0, 0, 15 * s, 50 * s);
		pop();

		push();
		angleMode(DEGREES);
		translate(x + (70 * s), y - (70 * s));
		rotate(45);
		rect(0, 0, 15 * s, 55 * s);
		pop();

		pop();

		if(this.onRestartButton(mouseX, mouseY) || this.onShareButton(mouseX, mouseY))
		{
			cursor('pointer')
		}
		else
		{
			cursor('default')
		}
	}
}

//--------------------HANDLES FOXES & CAVES--------------------//
foxes = 
{
	createCave: function (xPos, yPos, size, direction, numOfFoxes, foxSpeed, foxGap, maxNumOfLives, maxNumberOfFoxesOut)
	{
		c = 
		{
			xPos: xPos, 
			yPos: yPos, 
			size: size,
			originalSize: size,
			animation: {isAnimating: false, duration: foxes.caveAnimationData.animationDuration}, 
			direction: direction,
			maxNumberOfFoxesOut: maxNumberOfFoxesOut,
			numOfFoxes: numOfFoxes, 
			foxSpeed: foxSpeed, 
			foxGap: foxGap,
			caveFoxesArray: foxes.getCaveFoxesArray(xPos, yPos, direction, numOfFoxes, maxNumOfLives)
		}
		return c
	},

	getCaveFoxesArray: function(xPos, yPos, direction, numOfFoxes, maxNumOfLives)
	{
		foxesArray = []
		for(i = 0; i < numOfFoxes; i++)
		{
			newFox = 
			{
				xPos: xPos,
				yPos: yPos,
				isFalling: false,
				isDead: false,
				isOutside: false,
				foxDirectionSet: true,
				lives: round(random(0.6, maxNumOfLives)),
				direction: direction,
				movingData:
				{
					platformData: {onPlatform: false, platformIdx: null},
					cloudData: {onCloud: false, cloudIdx: null},
					groundData: {onGround: false, groundIdx: null}
				}
			}
			foxesArray.push(newFox)
		}
		return foxesArray
	},

	caves: [],

	caveColors: 
	{
		lightStone: [187, 192, 200],
		darkStone: [101, 115, 126],
		inside: [33, 14, 0]
	},

	foxColors:
	{
		darkFurLight: [255, 127, 9],
		darkFurDark: [206, 44, 0],
		highlights: [216, 220, 226],
		outlineColor: [77, 18, 0]
	},

	addCaves: function (caveData)
	{
		for(newCaveIdx = 0; newCaveIdx < caveData.length; newCaveIdx++)
		{
			currentCave = caveData[newCaveIdx]
			
			newCave = this.createCave(currentCave.xPos, currentCave.yPos, currentCave.size, currentCave.direction, currentCave.numOfFoxes, currentCave.foxSpeed, currentCave.foxGap, currentCave.maxNumOfLives, currentCave.maxNumberOfFoxesOut)
			this.caves.push(newCave)
		}	
	},

	caveAnimationData: 
	{
		animationDuration: 20,

		animationBounceSize: 1.01,
	},
	
	drawCaves: function()
	{
		for(caveIdx = 0; caveIdx < this.caves.length; caveIdx++)
		{	
			currentCave = this.caves[caveIdx]

			x = currentCave.xPos
			y = currentCave.yPos

			if(currentCave.animation.isAnimating)
			{
				animationDuration = this.caveAnimationData.animationDuration
				animationBounceSize = this.caveAnimationData.animationBounceSize

				//animation to bounce cave when fox comes out
				if(currentCave.animation.duration > animationDuration / 2)
				{
					currentCave.size *= animationBounceSize
				}
				else
				{
					this.caves[caveIdx].size *= 1 - abs(1 - animationBounceSize)
				}

				currentCave.animation.duration -= 1

				//stop animation when neeeded
				if(currentCave.animation.duration == 0)
				{
					currentCave.animation.isAnimating = false
					currentCave.animation.duration = animationDuration
					currentCave.size = currentCave.originalSize
				}
			}

			s = currentCave.size

			if(currentCave.direction == "left")
			{
				push();
				translate(-75 * s, -310 * s)
				noStroke();

				//inside cave
				fill(color(this.caveColors.inside))
				beginShape();
					vertex(x - (110 * s), y + (310 * s))
					vertex(x - (105 * s), y + (120 * s))
					vertex(x - (40 * s), y + (40 * s))
					vertex(x + (170 * s), y + (40 * s))
					vertex(x + (170 * s), y + (310 * s))
				endShape();


				//sorted from left -> right
					//sorted by y
				fill(color(this.caveColors.darkStone))
				rect(x - (120 * s), y + (260 * s), 30 * s, 30 * s)
				rect(x - (120 * s), y + (205 * s), 30 * s, 30 * s)
				rect(x - (120 * s), y + (140 * s), 40 * s, 40 * s)
				rect(x - (90 * s), y + (70 * s), 40 * s, 40 * s)
				rect(x - (80 * s), y + (50 * s), 40 * s, 40 * s)
				rect(x - (30 * s), y + (10 * s), 40 * s, 40 * s)
				rect(x + (40 * s), y + (10 * s), 50 * s, 50 * s)
				rect(x + (110 * s), y + (25 * s), 70 * s, 50 * s)
				rect(x + (110 * s), y + (60 * s), 60 * s, 60 * s)
				rect(x + (160 * s), y + (70 * s), 60 * s, 60 * s)
				rect(x + (140 * s), y + (120 * s), 95 * s, 95 * s)
				rect(x + (160 * s), y + (170 * s), 85 * s, 85 * s)
				rect(x + (200 * s), y + (230 * s), 80 * s, 80 * s)


				fill(color(this.caveColors.lightStone))
				rect(x - (120 * s), y + (280 * s), 30 * s, 30 * s)
				rect(x - (140 * s), y + (270 * s), 30 * s, 30 * s)
				rect(x - (130 * s), y + (230 * s), 35 * s, 35 * s)
				rect(x - (130 * s), y + (180 * s), 30 * s, 30 * s)
				rect(x - (110 * s), y + (100 * s), 40 * s, 40 * s)
				rect(x - (60 * s), y + (25 * s), 40 * s, 40 * s)
				rect(x, y, 50 * s, 50 * s)
				rect(x + (80 * s), y + (30 * s), 55 * s, 55 * s)
				rect(x + (90 * s), y + (15 * s), 70 * s, 50 * s)
				rect(x + (140 * s), y + (80 * s), 45 * s, 45 * s)
				rect(x + (200 * s), y + (125 * s), 25 * s, 25 * s)
				rect(x + (130 * s), y + (140 * s), 65 * s, 65 * s)
				rect(x + (140 * s), y + (220 * s), 90 * s, 90 * s)
				rect(x + (210 * s), y + (180 * s), 55 * s, 55 * s)
				rect(x + (250 * s), y + (270 * s), 40 * s, 40 * s)
				pop();
			}
			else if (currentCave.direction == "right")
			{
				push();
				translate(54 * s, -310 * s)
				noStroke();

				//inside cave
				fill(color(this.caveColors.inside))
				beginShape();
					vertex(x + (110 * s), y + (310 * s))
					vertex(x + (105 * s), y + (120 * s))
					vertex(x + (40 * s), y + (40 * s))
					vertex(x - (170 * s), y + (40 * s))
					vertex(x - (170 * s), y + (310 * s))
				endShape();


				//sorted from left -> right
					//sorted by y
				fill(color(this.caveColors.darkStone))
				rect(x + (90 * s), y + (260 * s), 30 * s, 30 * s)
				rect(x + (90 * s), y + (205 * s), 30 * s, 30 * s)
				rect(x + (80 * s), y + (140 * s), 40 * s, 40 * s)
				rect(x + (50 * s), y + (70 * s), 40 * s, 40 * s)
				rect(x + (40 * s), y + (50 * s), 40 * s, 40 * s)
				rect(x - (10 * s), y + (10 * s), 40 * s, 40 * s)
				rect(x - (90 * s), y + (10 * s), 50 * s, 50 * s)
				rect(x - (180 * s), y + (25 * s), 70 * s, 50 * s)
				rect(x - (170 * s), y + (60 * s), 60 * s, 60 * s)
				rect(x - (220 * s), y + (70 * s), 60 * s, 60 * s)
				rect(x - (235 * s), y + (120 * s), 95 * s, 95 * s)
				rect(x - (245 * s), y + (170 * s), 85 * s, 85 * s)
				rect(x - (280 * s), y + (230 * s), 80 * s, 80 * s)


				fill(color(this.caveColors.lightStone))
				rect(x + (90 * s), y + (280 * s), 30 * s, 30 * s)
				rect(x + (110 * s), y + (270 * s), 30 * s, 30 * s)
				rect(x + (95 * s), y + (230 * s), 35 * s, 35 * s)
				rect(x + (100 * s), y + (180 * s), 30 * s, 30 * s)
				rect(x + (70 * s), y + (100 * s), 40 * s, 40 * s)
				rect(x + (20 * s), y + (25 * s), 40 * s, 40 * s)
				rect(x - (50 * s), y, 50 * s, 50 * s)
				rect(x - (135 * s), y + (30 * s), 55 * s, 55 * s)
				rect(x - (160 * s), y + (15 * s), 70 * s, 50 * s)
				rect(x - (185 * s), y + (80 * s), 45 * s, 45 * s)
				rect(x - (225 * s), y + (125 * s), 25 * s, 25 * s)
				rect(x - (195 * s), y + (140 * s), 65 * s, 65 * s)
				rect(x - (230 * s), y + (220 * s), 90 * s, 90 * s)
				rect(x - (265 * s), y + (180 * s), 55 * s, 55 * s)
				rect(x - (290 * s), y + (270 * s), 40 * s, 40 * s)
				pop();
			}
		}

	},

	getNumberOfFoxesOutside: function()
	{
		foxesOutside = 0

		for(i = 0; i < this.caves.length; i++)
		{
			for(j = this.caves[i].caveFoxesArray.length - 1; j >= 0; j--)
			{
				f = this.caves[i].caveFoxesArray[j]
				if(f.isOutside){foxesOutside += 1}
			}
		}

		return foxesOutside
	},

	updateFoxes: function ()
	{

		console.log(this.caves)
		for(caveIdx = 0; caveIdx < this.caves.length; caveIdx++)
		{

			currentCave = this.caves[caveIdx]

			//handle letting out foxes from caves
			if(frameCount % currentCave.foxGap == 0)
			{
				for(foxIdx = this.caves[caveIdx].caveFoxesArray.length - 1; foxIdx >= 0; foxIdx--)
				{
					currentFox = this.caves[caveIdx].caveFoxesArray[foxIdx]
					foxLetOut = false

					numberOfFoxesOut = this.getNumberOfFoxesOutside()

					if(currentFox.isOutside == false && numberOfFoxesOut < currentCave.maxNumberOfFoxesOut)
					{
						foxLetOut = true
						currentFox.isOutside = true
						currentCave.animation.isAnimating = true;
					}

					if(foxLetOut){break}
				}
			}

			for(foxIdx = this.caves[caveIdx].caveFoxesArray.length - 1; foxIdx >= 0; foxIdx--)
			{
				currentFox = this.caves[caveIdx].caveFoxesArray[foxIdx]

				//keep fox yPos aligned with current platform
				if(currentFox.movingData.platformData.onPlatform)
				{
					platformHeight = drawTerrain.currentPlatforms[currentFox.movingData.platformData.platformIdx].yPos
					currentFox.yPos = platformHeight
				}

				//keep fox yPos aligned with current cloud
				if(currentFox.movingData.cloudData.onCloud)
				{

					cloudY = clouds.cloudsArray[currentFox.movingData.cloudData.cloudIdx].yPos + 60
					currentFox.yPos = cloudY
				}

				//keep fox yPos aligned with current cloud
				if(currentFox.movingData.groundData.onGround)
				{
					currentFox.yPos = floorPos_y
				}

				//values for checking if current fox has been "jumped on"
				if(this.checkFoxKilled(currentFox))
				{
					currentFox.lives -= 1;
					if(currentFox.lives <= 0)
					{
						currentFox.movingData.platformData.onPlatform = false
						currentFox.movingData.cloudData.onCloud = false
						currentFox.movingData.groundData.onGround = false
						currentFox.isDead = true;
						currentFox.direction = "front";
					}	
				}

				//code to update fox movingData

				//make fox fall off current platform if they're out of range
				if(currentFox.movingData.platformData.onPlatform)
				{
					gameCharXInRange = (currentFox.xPos > drawTerrain.currentPlatforms[currentFox.movingData.platformData.platformIdx].platformStart &&
										currentFox.xPos < drawTerrain.currentPlatforms[currentFox.movingData.platformData.platformIdx].platformEnd);
				
					if(gameCharXInRange == false)
					{
						currentFox.movingData.platformData.onPlatform = false;
						currentFox.foxDirectionSet = false;
						currentFox.isFalling = true;
					}
				}

				//make player fall off cloud if out of range
				if(currentFox.movingData.cloudData.onCloud)
				{
					cloudXLeft = clouds.cloudsArray[currentFox.movingData.cloudData.cloudIdx].xPos + 15
					cloudXRight = clouds.cloudsArray[currentFox.movingData.cloudData.cloudIdx].xPos + 175

					gameCharXInRange = (currentFox.xPos > cloudXLeft &&
										currentFox.xPos < cloudXRight);

					if(gameCharXInRange == false)
					{
						currentFox.movingData.cloudData.onCloud = false;
						currentFox.foxDirectionSet = false;
						currentFox.isFalling = true;
					}
				}

				//make player fall off ground if out of range
				if(currentFox.movingData.groundData.onGround)
				{
					groundXLeft = levels[currentLevel].groundPositionsArray[currentFox.movingData.groundData.groundIdx][0]
					groundXRight = levels[currentLevel].groundPositionsArray[currentFox.movingData.groundData.groundIdx][1]

					gameCharXInRange = (currentFox.xPos > groundXLeft &&
										currentFox.xPos < groundXRight);

					if(gameCharXInRange == false)
					{
						currentFox.movingData.groundData.onGround = false;
						currentFox.foxDirectionSet = false;
						currentFox.isFalling = true;
					}
				}

				//code to move foxes
				if(currentFox.isFalling && currentFox.isDead == false)
				{
					currentFox.yPos += currentCave.foxSpeed
					if(currentFox.yPos > height)
					{
						currentCave.animation.isAnimating = true;
						currentFox.xPos = currentCave.xPos
						currentFox.yPos = currentCave.yPos
						currentFox.direction = currentCave.direction
						currentFox.foxDirectionSet = true;
						currentFox.isFalling = false
					}
				}
				else if(currentFox.isDead == true)
				{
					currentFox.yPos += currentCave.foxSpeed * 2
					if(currentFox.yPos > resizeCanvasData.currentHeight + heightPos)
					{
						currentCave.caveFoxesArray.splice(foxIdx, 1)
					}
				}
				else
				{
					if(currentFox.direction == "left" && currentFox.isOutside)
					{
						currentFox.xPos -= currentCave.foxSpeed
					}
					else if(currentFox.direction == "right" && currentFox.isOutside)
					{
						currentFox.xPos += currentCave.foxSpeed
					}
				}
			}
		}
	},

	checkFoxKilled: function(currentFox)
	{
		jumpedOnY = currentFox.yPos - (95 * s)
		jumpedOnXRight= currentFox.xPos + (85 * s)
		jumpedOnXLeft = currentFox.xPos - (60 * s)

		xCharacter = rabbitCharacter.realWorldPos
		yCharacter = rabbitCharacter.getFeetPos() - heightPos
 		
		yHeightThreshold = 8

		xInRange = (xCharacter > jumpedOnXLeft) && (xCharacter < jumpedOnXRight)
		yInRange = abs(yCharacter - jumpedOnY) < yHeightThreshold

		if(xInRange && yInRange)
		{
			return true
		}
	},

	legData: 
	{
		//initialize fox data used to control walking animation
		rightFootForward: true,
		backLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null,  innerLegHeight: null},
		frontLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null, innerLegHeight: null}
	},

	foxSize: 0.7,

	drawFoxes: function ()
	{
		s = this.foxSize

		//control walking animation
		if(this.legData.rightFootForward == true && frameCount % 7 == 0)
		{
			this.legData.backLegs.outerLegHeight = 28 * s;
			this.legData.backLegs.innerLegHeight = 34 * s;
			this.legData.frontLegs.outerLegHeight = 34 * s;
			this.legData.frontLegs.innerLegHeight = 28 * s;
			this.legData.rightFootForward = false;
		}
		else if(this.legData.rightFootForward == false && frameCount % 7 == 0)
		{
			this.legData.backLegs.outerLegHeight = 34 * s;
			this.legData.backLegs.innerLegHeight = 28 * s;
			this.legData.frontLegs.outerLegHeight = 28 * s;
			this.legData.frontLegs.innerLegHeight = 34 * s;
			this.legData.rightFootForward = true;
		}

		
		//go through caves and draw foxes
		for(caveIdx = 0; caveIdx < this.caves.length; caveIdx++)
			for(foxIdx = this.caves[caveIdx].caveFoxesArray.length - 1; foxIdx >= 0; foxIdx--)
			{

				//update x and y with scrollPos and height Pos
				x = this.caves[caveIdx].caveFoxesArray[foxIdx].xPos
				y = this.caves[caveIdx].caveFoxesArray[foxIdx].yPos

				drawFoxBool = this.caves[caveIdx].caveFoxesArray[foxIdx].isOutside == true

				if(this.caves[caveIdx].caveFoxesArray[foxIdx].isFalling)
				{
					this.caves[caveIdx].caveFoxesArray[foxIdx].direction = "front"
				}
				
				if(this.caves[caveIdx].caveFoxesArray[foxIdx].direction == "right" && drawFoxBool)
				{
					push();
					translate(0, -225 * s);

					//tail colors
					fill(this.foxColors.darkFurLight)
					beginShape()
						vertex(x - (60 * s), y + (152 * s));
						vertex(x - (95 * s), y + (154 * s));
						vertex(x - (120 * s), y + (195 * s));
						vertex(x - (80 * s), y + (165 * s));
						vertex(x - (60 * s), y + (158 * s));
					endShape()

					fill(this.foxColors.darkFurDark)
					beginShape()
						vertex(x - (60 * s), y + (164 * s));
						vertex(x - (75 * s), y + (185 * s));
						vertex(x - (120 * s), y + (195 * s));
						vertex(x - (80 * s), y + (165 * s));
						vertex(x - (60 * s), y + (158 * s));
					endShape()

					fill(this.foxColors.highlights)
					beginShape()
						vertex(x - (120 * s), y + (195 * s));
						vertex(x - (108 * s), y + (175 * s));
						vertex(x - (97 * s), y + (190 * s));
					endShape()

					//tail
					noFill();
					beginShape();
						vertex(x - (60 * s), y + (152 * s));
						vertex(x - (95 * s), y + (154 * s));
						vertex(x - (120 * s), y + (195 * s));
						vertex(x - (75 * s), y + (185 * s));
						vertex(x - (60 * s), y + (164 * s));
					endShape();

					rect(x - (60 * s), y + (150 * s), 105 * s, 45 * s); //body

					//inner legs
					fill(this.foxColors.darkFurDark)
					rect(x - (50 * s), y + (190 * s), 15 * s, this.legData.backLegs.innerLegHeight);
					rect(x + (30 * s), y + (190 * s), 15 * s, this.legData.frontLegs.innerLegHeight);
					
					//inner leg styling
					fill(this.foxColors.outlineColor)
					rect(x - (50 * s), y + (180 * s) + this.legData.backLegs.innerLegHeight, 15 * s, 10 * s);
					rect(x + (30 * s), y + (180 * s) + this.legData.frontLegs.innerLegHeight, 15 * s, 10 * s);


					fill(this.foxColors.darkFurDark)
					//outer legs
					rect(x - (60 * s), y + (190 * s), 15 * s, this.legData.backLegs.outerLegHeight);
					rect(x + (20 * s), y + (190 * s), 15 * s, this.legData.frontLegs.outerLegHeight);

					//outer leg styling
					fill(this.foxColors.outlineColor)
					rect(x - (60 * s), y + (175 * s) + this.legData.backLegs.outerLegHeight, 15 * s, 15 * s);
					rect(x + (20 * s), y + (175 * s) + this.legData.frontLegs.outerLegHeight, 15 * s, 15 * s);

					//body colors
					fill(this.foxColors.darkFurDark)
					rect(x - (60 * s), y + (150 * s), 105 * s, 45 * s); //bottom
					fill(this.foxColors.darkFurLight)
					rect(x - (60 * s), y + (150 * s), 105 * s, 10 * s); //top

					//body white belly
					fill(this.foxColors.highlights);
					beginShape();
						vertex(x - (45 * s), y + (195 * s)) // bottom left
						vertex(x + (3 * s), y + (195 * s)) // bottom right
						vertex(x, y + (190 * s)) // top right
						vertex(x - (42 * s), y + (190 * s)) // top left
					endShape();

					//left ear
					fill(this.foxColors.darkFurDark)
					beginShape();
						vertex(x + (10 * s), y + (100 * s)) // top 
						vertex(x + (10 * s), y + (120 * s)) // bottom
						vertex(x + (30 * s), y + (120 * s)) // bottom inner
					endShape(CLOSE);

					//right ear
					beginShape();
						vertex(x + (80 * s), y + (100 * s)) // top
						vertex(x + (80 * s), y + (120 * s)) // bottom
						vertex(x + (60 * s), y + (120 * s)) // bottom inner
					endShape(CLOSE);

					//face colors
					fill(color(this.foxColors.darkFurLight))
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (155 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);

					fill(color(this.foxColors.highlights))
					beginShape();
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (180 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
						vertex(x + (45 * s), y + (155 * s)) //top middle
					endShape(CLOSE);

					//face
					noFill();
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (180 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);


					stroke(color(this.foxColors.outlineColor)); //black outline color
					strokeWeight(4 * s); //black outline width
					//features
					rect(x + (32 * s), y + (140 * s), 2 * s, 5 * s); //left eye
					rect(x + (55 * s), y + (140 * s), 2 * s, 5 * s); //right eye
					rect(x + (45 * s), y + (165 * s), 1 * s, 1 * s); //mouth

					pop();
				}
				else if(this.caves[caveIdx].caveFoxesArray[foxIdx].direction == "left" && drawFoxBool)
				{
					translateHeadBy = -105 * s
					translateBellyBy = 18 * s

					noStroke();

					push();
					translate(0, -225 * s);

					//tail colors
					fill(this.foxColors.darkFurLight)
					beginShape()
						vertex(x + (45 * s), y + (152 * s));
						vertex(x + (80 * s), y + (154 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()

					fill(this.foxColors.darkFurDark)
					beginShape()
						vertex(x + (45 * s), y + (164 * s));
						vertex(x + (60 * s), y + (185 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()

					fill(this.foxColors.highlights)
					beginShape()
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (93 * s), y + (175 * s));
						vertex(x + (82 * s), y + (190 * s));
					endShape()

					//tail
					noFill();
					beginShape();
						vertex(x + (45 * s), y + (152 * s));
						vertex(x + (80 * s), y + (154 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (60 * s), y + (185 * s));
						vertex(x + (45 * s), y + (164 * s));
					endShape();

					rect(x - (60 * s), y + (150 * s), 105 * s, 45 * s); //body

					//inner legs
					fill(this.foxColors.darkFurDark)
					rect(x - (50 * s), y + (190 * s), 15 * s, this.legData.backLegs.innerLegHeight);
					rect(x + (30 * s), y + (190 * s), 15 * s, this.legData.frontLegs.innerLegHeight);
					
					//inner leg styling
					fill(this.foxColors.outlineColor)
					rect(x - (50 * s), y + (180 * s) + this.legData.backLegs.innerLegHeight, 15 * s, 10 * s);
					rect(x + (30 * s), y + (180 * s) + this.legData.frontLegs.innerLegHeight, 15 * s, 10 * s);

					fill(this.foxColors.darkFurDark)

					//outer legs
					rect(x - (60 * s), y + (190 * s), 15 * s, this.legData.backLegs.outerLegHeight);
					rect(x + (20 * s), y + (190 * s), 15 * s, this.legData.frontLegs.outerLegHeight);

					//outer leg styling
					fill(this.foxColors.outlineColor)
					rect(x - (60 * s), y + (175 * s) + this.legData.backLegs.outerLegHeight, 15 * s, 15 * s);
					rect(x + (20 * s), y + (175 * s) + this.legData.frontLegs.outerLegHeight, 15 * s, 15 * s);

					//body colors
					fill(this.foxColors.darkFurDark)
					rect(x - (60 * s), y + (150 * s), 105 * s, 45 * s); //bottom
					fill(this.foxColors.darkFurLight)
					rect(x - (60 * s), y + (150 * s), 105 * s, 10 * s); //top

					push();
					translate(translateBellyBy, 0)
					//body white belly
					fill(this.foxColors.highlights);
					beginShape();
						vertex(x - (45 * s), y + (195 * s)) // bottom left
						vertex(x + (3 * s), y + (195 * s)) // bottom right
						vertex(x, y + (190 * s)) // top right
						vertex(x - (42 * s), y + (190 * s)) // top left
					endShape();

					pop();
					
					push();
					translate(translateHeadBy, 0)

					//left ear
					fill(this.foxColors.darkFurDark)
					beginShape();
						vertex(x + (10 * s), y + (100 * s)) // top 
						vertex(x + (10 * s), y + (120 * s)) // bottom
						vertex(x + (30 * s), y + (120 * s)) // bottom inner
					endShape(CLOSE);

					//right ear
					beginShape();
						vertex(x + (80 * s), y + (100 * s)) // top
						vertex(x + (80 * s), y + (120 * s)) // bottom
						vertex(x + (60 * s), y + (120 * s)) // bottom inner
					endShape(CLOSE);

					//face colors
					fill(color(this.foxColors.darkFurLight))
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (155 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);

					fill(color(this.foxColors.highlights))
					beginShape();
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (180 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
						vertex(x + (45 * s), y + (155 * s)) //top middle
					endShape(CLOSE);

					//face
					noFill();
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (180 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);

					stroke(color(this.foxColors.outlineColor)); //black outline color
					strokeWeight(4 * s); //black outline width

					//features
					rect(x + (32 * s), y + (140 * s), 2 * s, 5 * s); //left eye
					rect(x + (55 * s), y + (140 * s), 2 * s, 5 * s); //right eye
					rect(x + (45 * s), y + (165 * s), 1 * s, 1 * s); //mouth

					pop();

					pop();
				}
				else if(this.caves[caveIdx].caveFoxesArray[foxIdx].direction == "front" && drawFoxBool)
				{
					translateHeadBy = -45 * s
					translateTailByX = -22 * s
					translateTailByY = 55 * s
	
					noStroke();
					push();
					translate(0, -225 * s)
					push();
					push()
					translate(translateTailByX, translateTailByY)
	
					//tail colors
					fill(this.foxColors.darkFurDark)
					beginShape()
						vertex(x + (45 * s), y + (152 * s));
						vertex(x + (80 * s), y + (154 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()
	
					fill(this.foxColors.darkFurLight)
					beginShape()
						vertex(x + (45 * s), y + (164 * s));
						vertex(x + (60 * s), y + (185 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()
	
					fill(this.foxColors.highlights)
					beginShape()
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (95 * s), y + (175 * s));
						vertex(x + (80 * s), y + (190 * s));
					endShape()
	
					//tail
					noFill();
					beginShape();
						vertex(x + (45 * s), y + (152 * s));
						vertex(x + (80 * s), y + (154 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (60 * s), y + (185 * s));
						vertex(x + (45 * s), y + (164 * s));
					endShape();
					pop();
	
					fill(this.foxColors.darkFurLight);
	
					//main body
					rect(x - (25 * s), y + (150 * s), 50 * s, 70 * s); //body
	
					fill(this.foxColors.darkFurDark)
					//front legs
					rect(x - (35 * s), y + (186 * s), 20 * s, 20 * s); // front left leg
					rect(x + (15 * s), y + (186 * s), 20 * s, 20 * s); // front right leg
	
					fill(this.foxColors.highlights)
					rect(x - (10 * s), y + (190 * s), 20 * s, 30 * s); //body
	
					translate(translateHeadBy, 0)
	
					//left ear
					fill(this.foxColors.darkFurDark)
					beginShape();
						vertex(x + (10 * s), y + (100 * s)) // top 
						vertex(x + (10 * s), y + (120 * s)) // bottom
						vertex(x + (30 * s), y + (120 * s)) // bottom inner
					endShape(CLOSE);
	
					//right ear
					beginShape();
						vertex(x + (80 * s), y + (100 * s)) // top
						vertex(x + (80 * s), y + (120 * s)) // bottom
						vertex(x + (60 * s), y + (120 * s)) // bottom inner
					endShape(CLOSE);
	
					//face colors
					noStroke();
					fill(color(this.foxColors.darkFurLight))
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (155 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);
	
					fill(color(this.foxColors.highlights))
					beginShape();
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (180 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
						vertex(x + (45 * s), y + (155 * s)) //top middle
					endShape(CLOSE);
	
					//face
					noFill();
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (180 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);
	
					stroke(color(this.foxColors.outlineColor)); //black outline color
					strokeWeight(4 * s); //black outline width
					//features
					rect(x + (45 * s), y + (165 * s), 1 * s, 1 * s); //mouth
					if(this.caves[caveIdx].caveFoxesArray[foxIdx].isDead == true)
					{
						push();
						translate(45 * s, -12 * s)

						//left eye (1/2)
						push();
						angleMode(DEGREES);
						translate(x - (25 * s), y + (145 * s));
						rotate(-45);
						rect(0, 0, 2 * s, 20 * s);
						pop();
	
						//left eye (2/2)
						push();
						angleMode(DEGREES);
						translate(x - (10 * s), y + (143 * s));
						rotate(45);
						rect(0, 0, 2 * s, 20 * s);
						pop();
	
						//right eye (1/2)
						push();
						angleMode(DEGREES);
						translate(x + (10 * s), y + (145 * s));
						rotate(-45);
						rect(0, 0, 2 * s, 20 * s);
						pop();
	
						//right eye (2/2)
						push();
						angleMode(DEGREES);
						translate(x + (25 * s), y + (143 * s));
						rotate(45);
						rect(0, 0, 2 * s, 20 * s);
						pop();
						pop();
					}
					else
					{
						rect(x + (32 * s), y + (140 * s), 2 * s, 5 * s); //left eye
						rect(x + (55 * s), y + (140 * s), 2 * s, 5 * s); //right eye	
					}
					pop();
					pop();
				}
			}
	}
}

//--------------------CONTROLS POINTS SHOWING UP WHEN ITEMS COLLECTED--------------------//
animatePointsCollected = 
{
	currentAnimations: [],

	defaultDuration: 100,
	defaultHeight: 50,
	defaultSize: 60,

	newAnimation: function (text, duration, height, size)
	{
		a = 
		{
			text: text,
			duration: duration,
			iterationsPassed: 0,
			height: height * rabbitCharacter.size,
			size: size * rabbitCharacter.size,
			incrementValue: height/duration
		}

		return a
	},

	addNewAnimation: function(text, duration, height, size)
	{
		a = this.newAnimation(text, duration, height, size)
		this.currentAnimations.push(a)
	},

	animateActiveAnimations: function()
	{
		for(i = 0; i < this.currentAnimations.length; i++)
		{
			textFont(NESfont)
			currentAnimation = this.currentAnimations[i]
			textSize(currentAnimation.size)
			textAlign(CENTER)
			alphaValue = (255 - map(currentAnimation.iterationsPassed, 0, currentAnimation.duration, 0, 120))

			fill(255, 255, 255, alphaValue)
			noStroke();

			text(currentAnimation.text, rabbitCharacter.xPos, rabbitCharacter.getHeadPos() - currentAnimation.incrementValue * currentAnimation.iterationsPassed)

			currentAnimation.duration -= 1
			currentAnimation.iterationsPassed += 1

			if(currentAnimation.duration < 0)
			{
				this.currentAnimations.splice(i, 1)
			}
		}
	}
}

//--------------------RESIZE CANVAS FUNCTIONS (CONTROLS CANVAS RESIZING)--------------------//
updateCanvasData = function ()
{
	levels[currentLevel].scrollPosLeft = resizeCanvasData.currentWidth * 0.2
	levels[currentLevel].scrollPosRight = resizeCanvasData.currentWidth * 0.8
	levels[currentLevel].heightPosTop = resizeCanvasData.currentHeight * 0.2
	levels[currentLevel].heightPosBottom = resizeCanvasData.currentHeight * 0.65
	levels[currentLevel].characterYStart = floorPos_y - 111
}

updateYObjStart = function ()
{
	for(i = 0; i < levels[currentLevel].carrotPositionsArray.length; i++)
	{
		levels[currentLevel].carrotPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].heartPositionsArray.length; i++)
	{
		levels[currentLevel].heartPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].platformPositionsArray.length; i++)
	{
		levels[currentLevel].platformPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].cloudPositionsArray.length; i++)
	{
		levels[currentLevel].cloudPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].mountainPositionsArray.length; i++)
	{
		levels[currentLevel].mountainPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].treePositionsArray.length; i++)
	{
		levels[currentLevel].treePositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].enemyPositionsArray.length; i++)
	{
		levels[currentLevel].enemyPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].cavesData.length; i++)
	{
		levels[currentLevel].cavesData[i].yPos += resizeCanvasData.yObjStart
	}
	//update rabbit ypos
	levels[currentLevel].characterYStart += resizeCanvasData.yObjStart
}

//--------------------LEVELS OBJECT (STORES LEVEL DATA)--------------------//
levels = 
[
	//level 0
	{
		//vital char data 
		characterYStartHeightPos: 0,
		characterXStartScrollPos: 0,
		characterYStart: 322,
		characterXStart: 520,
		characterSize: 0.5,
		heightPosTop: null,
		heightPosBottom: null,
		scrollPosLeft: null,
		scrollPosRight: null,
		skyColor: [137,207,240],
		bulletInRangeValue: 20,
		//fox data
		cavesData: [{xPos: 1100, yPos: 94, size: 0.5, direction: "left", numOfFoxes: 200, foxSpeed: 5, foxGap: 10, maxNumOfLives: 4, maxNumberOfFoxesOut: 50}],
		//carrot data
		carrotColor: [246, 118, 34],
		carrotStemColor: [35, 92, 70],
		carrotPositionsArray: 
			[{xPos: 1225, yPos: 375, size: 0.2},
			{xPos: 1400, yPos: 15, size: 0.2},
			{xPos: 1600, yPos: -185, size: 0.2}],
		//lives data
		livesColor: [255, 0, 0],
		heartPositionsArray: 
			[{xPos: 2060, yPos: 375, size: 0.3}],
		//ground data
		grassLight: [234,242,5],
		grassDark: [210,217,4],
		dirtLight: [77,50,32],
		dirtDark: [191,184,90],
		bedRockLight: [115,56,36],
		bedRockDark: [67,53,32],
		groundPositionsArray:
			[[400, 640], [790, 1275], [2025, 2800]],
		//canyon data
		canyonPositionsArray:
			[{xPos: 640, canyonWidth: 150}, {xPos: 1275, canyonWidth: 750}],
		canyonColor: [137,207,240],
		//platform data
		platformPositionsArray:
			[{yPos: 200, platformStart: 2800, platformEnd: 3300},
			{yPos: 94, platformStart: 800, platformEnd: 1400}],
		platformGrassLight: [19,232,83],
		platformGrassDark: [12,86,25],
		platformDirtLight: [77,50,32],
		platformDirtDark: [55,34,25],
		platformBedRockLight: [35,21,14],
		platformBedRockDark: [13,9,6],
		//cloud data
		cloudPositionsArray: 
			[{xPos: 1200, yPos: 200, direction: "right", speed: [4, 4], maxLeft: 0, maxRight: 600},
			{xPos: 1300, yPos: 0, direction: "right", speed: [3, 3], maxLeft: 0, maxRight: 500},
			{xPos: 1500, yPos: -200, direction: "right", speed: [2, 2], maxLeft: 0, maxRight: 100},
			{xPos: 680, yPos: 250, direction: "right", speed: [1, 2], maxLeft: 0, maxRight: 10}],
		//mountain data
		sideMountainsColor: [126,116,116],
		middleMountainColor: [196,182,182],
		riverColor: [31,111,139],
		snowCapColor: [255,255,255],
		mountainPositionsArray:
			[{xPos: 2500, yPos: 432, scale: 2.7}],
		//tree data
		leavesColor: [0, 155, 0],
		trunkColor: [120, 100, 40],
		treePositionsArray:
			[{xPos: 480, yPos: 432, scale: 1.45}],
		//enemies data
		hatTopColor: [153, 76, 0],
		hatBottomColor: [102, 51, 0],
		gunTopColor: [128],
		gunBottomColor: [96],
		innerFootColor: [139,69,19],
		outerFootColor: [160,82,45],
		bodyColor: [0, 77, 0],
		faceColor: [191, 153, 115],
		bulletColor: [69],
		enemyPositionsArray:
			[{xPos: 1030, yPos: 392, scale: 1, firingFrequency: 120, firingSpeed: 6, maxBulletDistLeft: 225, maxBulletDistRight: 300, maxBulletDistIsX: false}],
		//child data
		childXPos: 3265,
		childYPos: 169,
		childSize: 0.3,
		childPlatformColor: [255],
		//yIdx updated (should only happen once)
		yIdxUpdated: false
	},
	//level 1
	{
		//vital char data 
		characterYStartHeightPos: 0,
		characterXStartScrollPos: 0,
		characterYStart: 485,
		characterXStart: 520,
		characterSize: 0.5,
		heightPosTop: null,
		heightPosBottom: null,
		scrollPosLeft: null,
		scrollPosRight: null,
		skyColor: [208,227,204],
		bulletInRangeValue: 25,
		//carrot data
		carrotColor: [246, 118, 34],
		carrotStemColor: [35, 92, 70],
		carrotPositionsArray: 
			[{xPos: 1300, yPos: 375, size: 0.2},
			{xPos: 1500, yPos: 39, size: 0.2},
			{xPos: 3375, yPos: -202, size: 0.2},
			{xPos: 3875, yPos: -202, size: 0.2},
			{xPos: 4050, yPos: 375, size: 0.2}],
		//heart data
		livesColor: [255, 0, 0],
		heartPositionsArray: 
			[{xPos: 1600, yPos: -207, size: 0.3},
			{xPos: 4065, yPos: 210, size: 0.3},
			{xPos: 4800, yPos: 375, size: 0.3}],
		//ground data
		grassLight: [243,180,139],
		grassDark: [223,145,94],
		dirtLight: [208,183,172],
		dirtDark: [165,136,122],
		bedRockLight: [84,60,44],
		bedRockDark: [67,53,32],
		groundPositionsArray:
			[[400, 640], [1040, 1350], [4375, 4875], [5100, 5600]],
		//canyon data
		canyonPositionsArray:
		[{xPos: 640, canyonWidth: 400}],
		canyonColor: [208,227,204],
		//platform data
		platformPositionsArray:
			[{yPos: 280, platformStart: 1400, platformEnd: 1950},
			{yPos: -150, platformStart: 1400, platformEnd: 1650},
			{yPos: -150, platformStart: 1700, platformEnd: 1950},
			{yPos: -150, platformStart: 2730, platformEnd: 3000},
			{yPos: -150, platformStart: 3250, platformEnd: 3500},
			{yPos: -150, platformStart: 3750, platformEnd: 4000},
			{yPos: -150, platformStart: 4250, platformEnd: 4500},
			{yPos: 432, platformStart: 4000, platformEnd: 4250}],
		platformGrassLight: [246,241,182],
		platformGrassDark: [238,231,153],
		platformDirtLight: [227,217,106],
		platformDirtDark: [210,198,71],
		platformBedRockLight: [185,151,20],
		platformBedRockDark: [161,126,7],
		//cloud data
		cloudPositionsArray: 
			[{xPos: 600, yPos: 310, direction: "right", speed: [5, 5], maxLeft: 0, maxRight: 290},
			{xPos: 1360, yPos: 30, direction: "right", speed: [4, 5], maxLeft: 0, maxRight: 450},
			{xPos: 1560, yPos: 30, direction: "right", speed: [3, 4], maxLeft: 200, maxRight: 250},
			{xPos: 1950, yPos: -224, direction: "right", speed: [3, 4], maxLeft: 0, maxRight: 600},
			{xPos: 3815, yPos: 30, direction: "right", speed: [3, 4], maxLeft: 0, maxRight: 450},
			{xPos: 4015, yPos: 200, direction: "right", speed: [4, 5], maxLeft: 200, maxRight: 250}],
		//mountain data
		sideMountainsColor: [188,148,90],
		middleMountainColor: [238,206,160],
		riverColor: [238,206,160],
		snowCapColor: [238,206,160],
		mountainPositionsArray:
			[{xPos: 3200, yPos: 680, scale: 5}],
		//tree data
		leavesColor: [244, 225, 172],
		trunkColor: [120, 100, 40],
		treePositionsArray:
			[{xPos: 1475, yPos: -150, scale: 2},
			{xPos: 2860, yPos: -150, scale: 1.2},
			{xPos: 5500, yPos: 432, scale: 1.2}],
		//enemies data
		hatTopColor: [216, 120, 70],
		hatBottomColor: [159, 77, 40],
		gunTopColor: [128],
		gunBottomColor: [96],
		innerFootColor: [145,131,124],
		outerFootColor: [212,203,185],
		bodyColor: [100, 28, 14],
		faceColor: [191, 153, 115],
		bulletColor: [69],
		enemyPositionsArray:
			[{xPos: 1200, yPos: 392, scale: 1, firingFrequency: 40, firingSpeed: 10, maxBulletDistLeft: 560, maxBulletDistRight: 200, maxBulletDistIsX: false},
			{xPos: 1440, yPos: 54, scale: 1, firingFrequency: 120, firingSpeed: 10, maxBulletDistLeft: 1400, maxBulletDistRight: 1950, maxBulletDistIsX: true},
			{xPos: 2050, yPos: -200, scale: 1, firingFrequency: 40, firingSpeed: 15, maxBulletDistLeft: 1950, maxBulletDistRight: 2700, maxBulletDistIsX: true},
			{xPos: 4375, yPos: -190, scale: 1, firingFrequency: 40, firingSpeed: 20, maxBulletDistLeft: 350, maxBulletDistRight: 250, maxBulletDistIsX: false},
			{xPos: 4170, yPos: 392, scale: 1, firingFrequency: 40, firingSpeed: 20, maxBulletDistLeft: 350, maxBulletDistRight: 250, maxBulletDistIsX: false},
			{xPos: 4130, yPos: 224, scale: 1, firingFrequency: 40, firingSpeed: 20, maxBulletDistLeft: 350, maxBulletDistRight: 250, maxBulletDistIsX: false}],
		//child data
		childXPos: 5400,
		childYPos: 565,
		childSize: 0.3,
		childPlatformColor: [255],
		//yIdx updated (should only happen once)
		yIdxUpdated: false
	}
]

//--------------------CHILD OBJECT--------------------//
child = 
{
	xPos: null,
	yPos: null,
	size: null,
	originalSize: null,
	originalXPos: null,
	originalYPos: null,
	colors: {platformColor: null},
	drawChildBool: true,
	isFound: false,

	setChildDimensions: function (xPos, yPos, size)
	{
		this.xPos = xPos
		this.yPos = yPos
		this.size = size
		this.originalSize = size
		this.originalXPos = xPos
		this.originalYPos = yPos
	},

	getFeetPos: function ()
	{
		return this.yPos + (100 * this.size)
	},
	
	drawChild: function ()
	{
		this.checkChildIsFound()

		if(this.isFound && this.drawChildBool)
		{
			if(this.originalSize * 2 > this.size)
			{
				this.size *= 1.012;
			}
			else
			{
				duration = 50 // controls duration in # of frames of collectables going to stats board
				statsBoard.childrenToStatsArray.push({xPos: this.xPos + scrollPos, yPos: this.yPos + heightPos, size: this.size, lifeSpan: duration,
							xUpdate: abs(this.xPos - (statsBoard.childrenData.xPos - scrollPos)) / duration, yUpdate: abs((this.yPos + heightPos) - statsBoard.childrenData.yPos) / duration, sizeUpdate: (statsBoard.childrenData.size - this.size) / duration})
				this.drawChildBool = false;
			}
		}


		s = this.originalSize
		x = this.originalXPos
		y = this.originalYPos

		noStroke();
		fill(this.colors.platformColor);
		rect(x - (60 * s), y + (64 * s), 125 * s, 40 * s)

		x = this.xPos
		y = this.yPos
		s = this.size

		if(this.drawChildBool)
		{

			stroke(statsBoard.childrenData.outlineColor); //black outline color
			strokeWeight(4 * s); //black outline width
			fill(statsBoard.childrenData.darkColor); // body color

			push();
			translate(0, -160 * s)

			push();
			translate(x - (25 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of left ear (for rotation)
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //left ear
			fill(statsBoard.childrenData.lightColor); // light color
			stroke(statsBoard.childrenData.lightColor); // light color
			rect(0, -(25 * s), 5 * s, 20 * s); //left inner ear
			pop();

			push();
			translate(x + (8 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of right ear (for rotation)
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //right ear
			fill(statsBoard.childrenData.lightColor); // light color
			stroke(statsBoard.childrenData.lightColor); // light color
			rect(0, -(25 * s), 5 * s, 20 * s);  //right inner ear
			pop();

			//main body
			rect(x - (20 * s), y + (150 * s), 45 * s, 70 * s); //body
			rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head
			rect(x - (15 * s), y + (140 * s), 2 * s, 20 * s); //left eye
			rect(x + (15 * s), y + (140 * s), 2 * s, 20 * s); //right eye

			//legs
			rect(x - (35 * s), y + (200 * s), 15 * s, 20 * s); // front left leg
			rect(x + (25 * s), y + (190 * s), 15 * s, 30 * s); // front right leg
			rect(x + (2 * s), y + (195 * s), 0 * s, 25 * s); // leg in middle
			rect(x + (33 * s), y + (188 * s), 15 * s, 15 * s); //tail

			fill(statsBoard.childrenData.lightColor); // light color
			stroke(statsBoard.childrenData.lightColor); // light color
			rect(x + (1 * s), y + (169 * s), 1 * s, 1 * s); //mouth
			pop();	
		}
	},

	checkChildIsFound: function ()
	{
		charX = rabbitCharacter.realWorldPos
		charY = rabbitCharacter.getCenterPos() - heightPos
		childRadius = this.size * 180
		childIsFound =  dist(this.xPos, this.yPos, charX, charY) < 50 / 2

		if(childIsFound && this.isFound == false)
		{
			this.isFound = true;
			collectedAnimations.addAnimation(this.xPos, this.getFeetPos(), color(196, 58, 30), color(150, 24, 0), {x: this.xPos})
		}

	}
}

//--------------------LIVES OBJECT--------------------//
lives = 
{
	color: null,

	heart: function (x, y, s)
	{
		h = 
		{
			x: x,
			y: y,
			currentYPos: y,
			size: s,
			originalSize: s,
			downAnimation: true,
			beenCollected: false,
			heartFloorPosY: y + (s * 122),
			inProximity: function (charX, charY)
			{
				heartX = this.x
				heartY = this.currentYPos + (10 * this.size)
				heartRadius = this.size * 180
				return dist(heartX, heartY, charX, charY) < heartRadius / 2

			}
		}
		return h
	},

	heartsArray: [],

	addHearts: function (heartsInput)
	{
		for(i = 0; i < heartsInput.length; i++)
		{
			this.heartsArray.push(this.heart(heartsInput[i].xPos, heartsInput[i].yPos + 20, heartsInput[i].size))
		}
	},

	drawHearts: function()
	{
		for(i = this.heartsArray.length - 1; i >= 0; i--)
		{
			//check if player is close to this heart

			if(this.heartsArray[i].inProximity(rabbitCharacter.realWorldPos, rabbitCharacter.getCenterPos() - heightPos))
			{
				if(!this.heartsArray[i].beenCollected)
				{
					playSound("lifeCollected")
					statsBoard.addPoints(statsBoard.pointQuantities.life)
					collectedAnimations.addAnimation(this.heartsArray[i].x, this.heartsArray[i].heartFloorPosY, color(196, 58, 30), color(150, 24, 0), this.heartsArray[i])

				}
				
				this.heartsArray[i].beenCollected = true;
			}

			// animate hearts if they haven't been collected
			if(this.heartsArray[i].downAnimation && !this.heartsArray[i].beenCollected)
			{
				if(this.heartsArray[i].currentYPos - this.heartsArray[i].y == 5)
				{
					this.heartsArray[i].downAnimation = false;
				}
				if(frameCount % 3 == 0)
				{
					this.heartsArray[i].currentYPos++;
				}
			}
			else if (!this.heartsArray[i].downAnimation && !this.heartsArray[i].beenCollected)
			{
				if(this.heartsArray[i].y - this.heartsArray[i].currentYPos == 5)
				{
					this.heartsArray[i].downAnimation = true;
				}
				if(frameCount % 3 == 0)
				{
					this.heartsArray[i].currentYPos--;
				}
			} 

			//animate the hearts once they are collected
			if(this.heartsArray[i].beenCollected)
			{
				if(this.heartsArray[i].originalSize * 2 > this.heartsArray[i].size)
				{
					this.heartsArray[i].size *= 1.012;
				}
				else
				{
					h = this.heartsArray[i]
					duration = 50 // controls duration in # of frames of collectables going to stats board
					statsBoard.heartsToStatsArray.push({xPos: h.x + scrollPos, yPos: h.y + heightPos, size: h.size, lifeSpan: duration,
						xUpdate: abs(h.x - (statsBoard.heartData.xPos - scrollPos)) / duration, yUpdate: abs((h.y + heightPos) - statsBoard.heartData.yPos) / duration, sizeUpdate: (statsBoard.heartData.size - h.size) / duration})
					this.heartsArray.splice(i, 1);
					continue;
				}
			}

			//draw the hearts to the canvas
			x = this.heartsArray[i].x
			y = this.heartsArray[i].currentYPos
			s = this.heartsArray[i].size

			noStroke();
			fill(this.color)

			push();
			translate(-(50 * s), -(25 * s));
			rect(x, y, 100 * s, 40 * s) // main

			rect(x + (10 * s), y - (10 * s), 35 * s, 20 * s) // top left
			rect(x + (20 * s), y - (15 * s), 15 * s, 15 * s) // very top left

			rect(x + (55 * s), y - (10 * s), 35 * s, 20 * s) // top right
			rect(x + (65 * s), y - (15 * s), 15 * s, 15 * s) // very top right


			rect(x + (15 * s), y + (30 * s), 70 * s, 20 * s) // bottom

			rect(x + (30 * s), y + (40 * s), 40 * s, 20 * s) // very bottom
			rect(x + (43 * s), y + (55 * s), 15 * s, 15 * s) // very very bottom
			pop();

		}
	}
}

//--------------------STATS BOARD OBJECT--------------------//
statsBoard = 
{
	score: 0,

	totalScore: null,

	deathHandled: false,

	updateTotals: function ()
	{
		carrotTotal = 0;
		enemyTotal = 0;
		livesTotal = 0;
		childrenTotal = levels.length; //one less than all levels (last level finds wife)

		for(i = 0; i < levels.length; i++)
		{
			carrotTotal += levels[i].carrotPositionsArray.length
			livesTotal += levels[i].heartPositionsArray.length
			enemyTotal += levels[i].enemyPositionsArray.length
		}

		this.lives.total = livesTotal
		this.enemies.total = enemyTotal
		this.carrots.total = carrotTotal
		this.children.total = childrenTotal

		this.totalScore = (livesTotal * this.pointQuantities.life) + (carrotTotal * this.pointQuantities.carrot) + (enemyTotal * this.pointQuantities.enemy) + (childrenTotal * this.pointQuantities.child)

		this.lives.current = 1;
		this.score = 0;

	},

	updateCurrentLevel: function ()
	{
		this.carrots.thisLevelTotal = levels[currentLevel].carrotPositionsArray.length
		this.enemies.thisLevelTotal = levels[currentLevel].enemyPositionsArray.length
		this.carrots.thisLevel = 0;
		this.enemies.thisLevel = 0;
	},

	handlePlayerDeath: function ()
	{
		if(rabbitCharacter.isDead == true)
		{
			if(!this.deathHandled)
			{
				statsBoard.lives.current -= 1
				statsBoard.removePoints(statsBoard.pointQuantities.death)
				this.deathHandled = true
			}
			if(rabbitCharacter.getCenterPos() > resizeCanvasData.currentHeight && this.lives.current <= 0)
			{
				messages.drawMessageBool = true;
			}
			else if(rabbitCharacter.getCenterPos() > resizeCanvasData.currentHeight)
			{
				respawn()
			}
		}
	},

	addPoints: function (points)
	{
		animatePointsCollected.addNewAnimation(points.toString(), animatePointsCollected.defaultDuration, animatePointsCollected.defaultHeight, animatePointsCollected.defaultSize)
	},

	removePoints: function (points)
	{
		this.score -= points
		animatePointsCollected.addNewAnimation("-" + points.toString(), animatePointsCollected.defaultDuration, animatePointsCollected.defaultHeight, animatePointsCollected.defaultSize)
	},

	pointQuantities:
	{
		carrot: 50,
		life: 100,
		child: 750,
		enemy: 100,
		death: 100,
	},

	lives:
	{
		current: 1,
		total: null,

	},

	enemies:
	{
		thisLevel: 0,
		thisLevelTotal: null,
		total: null,
		totalKilled: 0
	},

	carrots:
	{
		thisLevel: 0,
		thisLevelTotal: null,
		total: null,
		totalCollected: 0
	},

	children:
	{
		current: 0,
		total: null
	},

	wife:
	{
		current: 0,
		total: 1,
	},

	carrotData:
	{
		xPos: 55,
		yPos: 159,
		size: 0.11
	},

	heartData:
	{
		xPos: 180,
		yPos: 159,
		size: 0.2
	},

	childrenData:
	{
		xPos: 53,
		yPos: 120,
		size: 0.2,
		outlineColor: [0],
		lightColor: [205,160,106],
		darkColor: [200,135,82]
		
	},

	wifeData:
	{
		xPos: 150,
		yPos: 120,
		size: 0.25,
		outlineColor: [0],
		lightColor: [146,94,58],
		darkColor: [127,77,45]
	},

	carrotsToStatsArray: [],

	drawCarrotsToStats: function ()
	{
		for(i = 0; i < this.carrotsToStatsArray.length; i++)
		{
			currentCarrot = this.carrotsToStatsArray[i]
			currentCarrot.xPos -= currentCarrot.xUpdate
			currentCarrot.yPos -= currentCarrot.yUpdate
			currentCarrot.size += currentCarrot.sizeUpdate
			this.drawCarrot(currentCarrot.xPos, currentCarrot.yPos, currentCarrot.size)
			currentCarrot.lifeSpan -= 1
			if(currentCarrot.lifeSpan <= 0)
			{
				statsBoard.score += this.pointQuantities.carrot;
				statsBoard.carrots.thisLevel += 1;
				statsBoard.carrots.totalCollected += 1;
				this.carrotsToStatsArray.splice(i, 1)
			}
		}
	},

	heartsToStatsArray: [],

	drawHeartsToStats: function ()
	{
		for(i = 0; i < this.heartsToStatsArray.length; i++)
		{
			currentHeart = this.heartsToStatsArray[i]
			currentHeart.xPos -= currentHeart.xUpdate
			currentHeart.yPos -= currentHeart.yUpdate
			currentHeart.size += currentHeart.sizeUpdate
			this.drawHeart(currentHeart.xPos, currentHeart.yPos, currentHeart.size)
			currentHeart.lifeSpan -= 1
			if(currentHeart.lifeSpan <= 0)
			{
				statsBoard.score += this.pointQuantities.life;
				statsBoard.lives.current += 1;
				this.heartsToStatsArray.splice(i, 1)
			}
		}
	},

	childrenToStatsArray: [],

	drawChildrenToStats: function ()
	{
		for(i = 0; i < this.childrenToStatsArray.length; i++)
		{
			currentChild = this.childrenToStatsArray[i]
			currentChild.xPos -= currentChild.xUpdate
			currentChild.yPos -= currentChild.yUpdate
			currentChild.size += currentChild.sizeUpdate
			this.drawRabbit(currentChild.xPos, currentChild.yPos, currentChild.size, this.childrenData.outlineColor, this.childrenData.lightColor, this.childrenData.darkColor)
			currentChild.lifeSpan -= 1
			if(currentChild.lifeSpan <= 0)
			{
				statsBoard.score += this.pointQuantities.child;
				statsBoard.children.current += 1;
				this.childrenToStatsArray = [];
				currentLevel += 1;
				if(levels[currentLevel].yIdxUpdated == false)
				{
					updateYObjStart()
					levels[currentLevel].yIdxUpdated = true
				}
				startGame();
			}
		}
	},

	drawBoard: function ()
	{
		textSize(30)
		textAlign(LEFT)
		textFont(NESfont)
		noStroke()

		fill(255)
		stroke(230);
		strokeWeight(5);
		rect(20, 20, 230, 170, 15) //main board
		noStroke();

		fill(0)
		text("Score:", 45, 60)
		textAlign(RIGHT)
		text(this.score, 220, 60) // score

		textAlign(LEFT);
		text("Level:", 45, 90)
		textAlign(RIGHT)
		text(currentLevel + "/" + 5, 220, 90) // level

		textSize(25)

		textAlign(RIGHT);
		text(this.children.current + "/" + this.children.total, 120, 125) // children
		text(this.wife.current + "/" + this.wife.total, 220, 125) // wife

		fill(230);
		rect(35, 145, 200, 30, 10) // current level stats
		fill(0)

		textSize(15)

		text(this.carrots.thisLevel + "/" + this.carrots.thisLevelTotal, 100, 164)
		text(this.enemies.thisLevel + "/" + this.enemies.thisLevelTotal, 160, 164)
		text(this.lives.current + "/" + this.lives.total, 225, 164) // lives
		

		// DRAW CARROT SYMBOL
		this.drawCarrot(this.carrotData.xPos, this.carrotData.yPos, this.carrotData.size)
		// DRAW LIVES SYMBOL
		this.drawHeart(this.heartData.xPos, this.heartData.yPos, this.heartData.size)
		// DRAW CHILD SYMBOL
		this.drawRabbit(this.childrenData.xPos, this.childrenData.yPos, this.childrenData.size, this.childrenData.outlineColor, this.childrenData.lightColor, this.childrenData.darkColor)
		// DRAW MOTHER SYMBOL
		this.drawRabbit(this.wifeData.xPos, this.wifeData.yPos, this.wifeData.size, this.wifeData.outlineColor, this.wifeData.lightColor, this.wifeData.darkColor)

		//DRAW ENEMY SYMBOL
		x = 117
		y = 162
		s = 0.18
		fill(enemies.enemyColors.innerFoot)
		rect(x - (20 * s), y + (15 * s), 12 * s, 25 * s) // inner foot
		fill(enemies.enemyColors.body)
		rect(x - (20 * s), y - (30 * s), 40 * s, 60 * s) // main body
		fill(enemies.enemyColors.outerFoot)
		rect(x + (10 * s), y + (15 * s), 15 * s, 25 * s) // outer foot

		fill(enemies.enemyColors.face)
		rect(x - (14 * s), y - (50 * s), 28 * s, 20 * s) // head
		fill(enemies.enemyColors.hatBottom)
		rect(x - (32 * s), y - (59 * s), 60 * s, 9 * s) // hat brim
		fill(enemies.enemyColors.hatTop)
		rect(x - (14 * s), y - (70 * s), 28 * s, 11 * s) // hat top

		fill(enemies.enemyColors.gunBottom)
		rect(x - (14 * s), y - (7 * s), 16 * s, 10 * s) // gun handle
		fill(enemies.enemyColors.gunTop)
		rect(x - (30 * s), y - (15 * s), 65 * s, 9 * s) // gun barrel


	},

	drawCarrot: function (x, y, s)
	{
		noStroke();
		fill(carrots.innerColor)
		//main carrot
		push();
		translate(-(60 * s), 0)
		rect(x + (20 * s), y - (40 * s), 80 * s, 80 * s)
		rect(x, y, 60 * s, 60 * s)
		rect(x - (20 * s), y + (40 * s), 40 * s, 40 * s)
		
		//carrot stems
		push();
		translate(x + (80 * s), y - (30 * s), 20 * s, 20 * s);
		fill(carrots.outerColor);
		angleMode(DEGREES);
		rect(0, 0, 60 * s, 25 * s);
		rotate(-45);
		rect(0, -4 * s, 60 * s, 25 * s);
		rotate(-45);
		rect(-10 * s, -12.5 * s, 60 * s, 25 * s);
		pop();
		pop();
	},

	drawHeart: function(x, y, s)
	{

		fill(lives.color)
		noStroke();
		push();
		translate(-(50 * s), -(25 * s));
		rect(x, y, 100 * s, 40 * s) // main

		rect(x + (10 * s), y - (10 * s), 35 * s, 20 * s) // top left
		rect(x + (20 * s), y - (15 * s), 15 * s, 15 * s) // very top left

		rect(x + (55 * s), y - (10 * s), 35 * s, 20 * s) // top right
		rect(x + (65 * s), y - (15 * s), 15 * s, 15 * s) // very top right


		rect(x + (15 * s), y + (30 * s), 70 * s, 20 * s) // bottom

		rect(x + (30 * s), y + (40 * s), 40 * s, 20 * s) // very bottom
		rect(x + (43 * s), y + (55 * s), 15 * s, 15 * s) // very very bottom
		pop();
	},

	drawRabbit: function(x, y, s, outlineColor, lightColor, darkColor)
	{
		stroke(outlineColor); //black outline color
		strokeWeight(4 * s); //black outline width
		fill(darkColor); // body color

		push();
		translate(0, -160 * s)

		push();
		translate(x - (25 * s) + ((20 * s) / 2), 
				y + (80 * s) + (40 * s)); //center of left ear (for rotation)
		rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //left ear
		fill(lightColor); // light color
		stroke(lightColor); // light color
		rect(0, -(25 * s), 5 * s, 20 * s); //left inner ear
		pop();

		push();
		translate(x + (8 * s) + ((20 * s) / 2), 
				y + (80 * s) + (40 * s)); //center of right ear (for rotation)
		rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //right ear
		fill(lightColor); // light color
		stroke(lightColor); // light color
		rect(0, -(25 * s), 5 * s, 20 * s);  //right inner ear
		pop();

		//main body
		rect(x - (20 * s), y + (150 * s), 45 * s, 70 * s); //body
		rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head
		rect(x - (15 * s), y + (140 * s), 2 * s, 20 * s); //left eye
		rect(x + (15 * s), y + (140 * s), 2 * s, 20 * s); //right eye

		//legs
		rect(x - (35 * s), y + (200 * s), 15 * s, 20 * s); // front left leg
		rect(x + (25 * s), y + (190 * s), 15 * s, 30 * s); // front right leg
		rect(x + (2 * s), y + (195 * s), 0 * s, 25 * s); // leg in middle
		rect(x + (33 * s), y + (188 * s), 15 * s, 15 * s); //tail

		fill(lightColor); // light color
		stroke(lightColor); // light color
		rect(x + (1 * s), y + (169 * s), 1 * s, 1 * s); //mouth

		pop();
	}
}

//--------------------CANYONS OBJECT--------------------//
canyons = 
{
	color: null,

	canyonsArray: [],

	createCanyon: function (x, canyonWidth)
	{
		c =
		{
			x: x,
			canyonWidth: canyonWidth,
			checkCollision: function(xPos, yPos)
			{
				yInRange = yPos + 10 > floorPos_y + heightPos
				xInRange = (xPos < (this.canyonWidth + this.x) && xPos > this.x);
				return xInRange && yInRange
			}
		}
		return c
	},

	addCanyons: function (canyonData)
	{
		for(i = 0; i < canyonData.length; i++)
		{
			this.canyonsArray.push(this.createCanyon(canyonData[i].xPos, canyonData[i].canyonWidth))
		}
	},

	drawCanyons: function()
	{
		for(i = 0; i < this.canyonsArray.length; i++)
		{
			if(this.canyonsArray[i].checkCollision(rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos()) && rabbitCharacter.isDead == false && statsBoard.deathHandled == false)
			{
				rabbitCharacter.isDead = true;
			
			}
			fill(this.color);
			rect(this.canyonsArray[i].x, floorPos_y - 1, this.canyonsArray[i].canyonWidth, 400)
		}
	}
}

//--------------------TREES OBJECT--------------------//
trees = 
{
	treeIndicies: [],

	treeColors: 
	{
		leaves: null,
		trunk: null,
	},

	drawTrees: function ()
	{
		noStroke();
		for (var i = 0; i < this.treeIndicies.length; i++)
    	{
			x = this.treeIndicies[i].xPos
			y = this.treeIndicies[i].yPos
			s = this.treeIndicies[i].scale

			push();
			translate(-25 * s, -150 * s);
			fill(this.treeColors.trunk)	
			rect(x, y, 50 * s, 150 * s)
		
			fill(this.treeColors.leaves)
			rect(x - (100 * s), y - (100 * s), 250 * s, 100 * s)
			rect(x - (50 * s), y - (180 * s), 150 * s, 80 * s)
			rect(x, y - (205 * s), 50 * s, 25 * s)

			pop();
   		}
	}
}

//--------------------MOUNTAINS OBJECT--------------------//
mountains = 
{
	mountainIndcies: [],

	mountainColors: 
	{
		sideMountains: null,
		middleMountain: null,
		river: null,
		snowCap: null
	},

	drawMountains: function ()
	{
		noStroke();
		for(i = 0; i < this.mountainIndcies.length; i ++)
		{
			x = this.mountainIndcies[i].xPos
			y = this.mountainIndcies[i].yPos
			s = this.mountainIndcies[i].scale

			push();
			translate(0, -(s * 232));

			//side mountains
			fill(this.mountainColors.sideMountains)
			triangle(x - (40 * s), y + (100 * s),
					 x - (80 * s), y + (232 * s), 
					 x, y + (232 * s))
			triangle(x + (40 * s), y + (100 * s), 
					 x, y + (232 * s), 
					 x + (80 * s), y + (232 * s))
			//middle mountain
			fill(this.mountainColors.middleMountain)
			triangle(x, y, 
					 x - (60 * s), y + (232 * s), 
					 x + (60 * s), y + (232 * s))
			//snow cap
			fill(this.mountainColors.snowCap)
			triangle(x, y,
					 x - (15 * s), y + (58 * s),
					 x + (15 * s), y + (58 * s))
			//river
			fill(this.mountainColors.river)
			beginShape();
			vertex(x, y)
			vertex(x - (5 * s), y + (75 * s));
			vertex(x - (5 * s), y + (150 * s));
			vertex(x - (35 * s), y + (232 * s));
			vertex(x + (10 * s), y + (232 * s));
			vertex(x + (20 * s), y + (150 * s));
			vertex(x + (5 * s), y + (75 * s))
			endShape(CLOSE);   
			pop();
		}
	}
}

//--------------------CLOUDS OBJECT--------------------//
clouds =
{
	updateAnimalsOnCloud: function (cloudIdx)
	{

		cloudXLeft = this.cloudsArray[cloudIdx].xPos + 15
		cloudXRight = this.cloudsArray[cloudIdx].xPos + 175
		cloudY = this.cloudsArray[cloudIdx].yPos + heightPos + 60

		//update character on clouds
		gameCharXInRange = (rabbitCharacter.realWorldPos > cloudXLeft &&
							rabbitCharacter.realWorldPos < cloudXRight);

		gameCharYInRange = abs(rabbitCharacter.getFeetPos() - (cloudY)) < 5

		onCloud = gameCharXInRange && gameCharYInRange && rabbitCharacter.jumpingData.goingUpwards == false
		if(onCloud)
		{
			rabbitCharacter.ridingCloudData.onCloud = true;
			rabbitCharacter.onFloor = true;
			rabbitCharacter.ridingCloudData.cloudRiding = cloudIdx;
		}

		//check for whether foxes are on clouds
		for(caveIdx = 0; caveIdx < foxes.caves.length; caveIdx++)
		{
			for(foxIdx = foxes.caves[caveIdx].caveFoxesArray.length - 1; foxIdx >= 0; foxIdx--)
			{
				currentFox = foxes.caves[caveIdx].caveFoxesArray[foxIdx]


				foxXInRange = (currentFox.xPos > cloudXLeft &&
								currentFox.xPos < cloudXRight)

				foxYInRange = abs((currentFox.yPos + heightPos) - cloudY) < 8

				onCloud = foxXInRange && foxYInRange

				if(onCloud && currentFox.isDead == false)
				{
					currentFox.movingData.cloudData.onCloud = true
					currentFox.movingData.cloudData.cloudIdx = cloudIdx
					currentFox.isFalling = false

					if(random(0, 1) > 0.5 && currentFox.foxDirectionSet == false)
					{
						currentFox.direction = "left"
					}
					else if(currentFox.foxDirectionSet == false)
					{
						currentFox.direction = "right"
					}

					currentFox.foxDirectionSet = true
				}
			}
		}

	},

	updateCloudObjects: function (cloudIdx)
	{
		currentCloud = this.cloudsArray[cloudIdx]
		//check all carrots
		for(i = 0; i < carrots.carrotArray.length; i++)
		{
			currentCarrot = carrots.carrotArray[i]
			xInRange = (currentCarrot.x > currentCloud.xPos + 15 && currentCarrot.x < currentCloud.xPos + 175)
			yInRange = abs((currentCarrot.y + heightPos) - (currentCloud.yPos + heightPos)) < 50
			if(xInRange && yInRange)
			{
				if(carrots.carrotArray[i].cloudData.onCloud == false)
				{
					carrots.carrotArray[i].cloudData.onCloud = true
					carrots.carrotArray[i].cloudData.cloudIdx = cloudIdx
				}
				if(carrots.carrotArray[i].cloudData.onCloud && carrots.carrotArray[i].cloudData.cloudIdx == cloudIdx)
				{
					if(currentCloud.direction == "left")
					{
						currentCarrot.x -= currentCloud.speed
					}
					else if (currentCloud.direction == "right")
					{
						currentCarrot.x += currentCloud.speed
					}
				}
			}			
		}

		//check all hearts
		for(i = 0; i < lives.heartsArray.length; i++)
		{
			currentHeart = lives.heartsArray[i]
			xInRange = (currentHeart.x > currentCloud.xPos + 15 && currentHeart.x < currentCloud.xPos + 175)
			yInRange = abs((currentHeart.y + heightPos) - (currentCloud.yPos + heightPos)) < 60

			if(xInRange && yInRange)
			{
				if(currentCloud.direction == "left")
				{
					currentHeart.x -= currentCloud.speed
				}
				else if (currentCloud.direction == "right")
				{
					currentHeart.x += currentCloud.speed
				}
			}			
		}

		//check all enemies
		for(i = 0; i < enemies.enemiesArray.length; i++)
		{
			currentEnemy = enemies.enemiesArray[i]
			xInRange = (currentEnemy.xPos > currentCloud.xPos + 15 && currentEnemy.xPos < currentCloud.xPos + 175)
			yInRange = abs((currentEnemy.yPos + heightPos) - (currentCloud.yPos + heightPos)) < 60

			if(xInRange && yInRange)
			{
				if(enemies.enemiesArray[i].cloudData.onCloud == false)
				{
					enemies.enemiesArray[i].cloudData.onCloud = true
					enemies.enemiesArray[i].cloudData.cloudIdx = cloudIdx
				}
				if(enemies.enemiesArray[i].cloudData.onCloud && enemies.enemiesArray[i].cloudData.cloudIdx == cloudIdx)
				{
					if(currentCloud.direction == "left")
					{
						currentEnemy.xPos -= currentCloud.speed
					}
					else if(currentCloud.direction == "right")
					{
						currentEnemy.xPos += currentCloud.speed
					}
				}
			}			
		}

		// //check child
		// for(i = 0; i < ; i ++)
		// {
		// 	xInRange
		// 	yInRange
		// 	if(xInRange && yInRange)
		// 	{
				
		// 	}
		// }
	},


	createCloud: function (xPos, yPos, direction, speed, maxLeft, maxRight)
	{
		c = 
		{
			xPos: xPos,
			yPos: yPos,
			direction: direction,
			speed: random(speed[0], speed[1]),
			realPos: xPos,
			squares: null,
			maxLeft: xPos - maxLeft,
			maxRight: xPos + maxRight
		}
		return c
	},

	generateCloudSquares: function (cloudIdx)
	{
		x = 0
		y = this.cloudsArray[cloudIdx].yPos
		squares = [];
		
		for(i = 0; i < 3; i++)
		{
			for(j = 0; j < 5; j++)
			{
				cloudSize = 30
				if(j > 0 && j < 4)
				{
					cloudSize = 50
				}
				xRandom = (x + random(-10, 10)) + (j * 35)
				if(j == 0)
				{
					xRandom += 20;
				}
				yRandom = (y + random(-10, 10)) + (i * 20)
				cloudSquare = 
				{
					x: xRandom,
					y: yRandom,
					size: cloudSize
				}
				squares.push(cloudSquare)
			}
		}
		return squares
	},

	cloudsArray: [],

	addClouds: function (inputArray)
	{
		for(cloudIdx = 0; cloudIdx < inputArray.length; cloudIdx++)
		{
			currentInput = inputArray[cloudIdx];
			cloud = this.createCloud(currentInput.xPos, currentInput.yPos, currentInput.direction, currentInput.speed, currentInput.maxLeft, currentInput.maxRight)
			this.cloudsArray.push(cloud)
			cloud.squares = this.generateCloudSquares(this.cloudsArray.length - 1)
		}
	},

	drawClouds: function ()
	{
		for(cloudIdx = 0; cloudIdx < this.cloudsArray.length; cloudIdx++)
		{
			this.updateAnimalsOnCloud(cloudIdx)
			this.updateCloudObjects(cloudIdx)

			//handle randomized clouds
			if(frameCount % 60 == 0)
			{
				cloudSquares = this.generateCloudSquares(cloudIdx)
				this.cloudsArray[cloudIdx].squares = cloudSquares
			}

			//handle cloud animation
			currentCloudX = this.cloudsArray[cloudIdx].realPos
			maxLeft = this.cloudsArray[cloudIdx].maxLeft
			maxRight = this.cloudsArray[cloudIdx].maxRight
			if(this.cloudsArray[cloudIdx].direction == "left")
			{
				if(currentCloudX < maxLeft)
				{
					this.cloudsArray[cloudIdx].direction = "right"
				}
				else
				{
					this.cloudsArray[cloudIdx].xPos -= this.cloudsArray[cloudIdx].speed;
					this.cloudsArray[cloudIdx].realPos -= this.cloudsArray[cloudIdx].speed;
				}
			}
			else
			{
				if(currentCloudX > maxRight)
				{
					this.cloudsArray[cloudIdx].direction = "left"
				}
				else
				{
					this.cloudsArray[cloudIdx].xPos += this.cloudsArray[cloudIdx].speed
					this.cloudsArray[cloudIdx].realPos += this.cloudsArray[cloudIdx].speed;
				}
			}

			//draw out each individual square
			for(squareIdx = 0; squareIdx < this.cloudsArray[cloudIdx].squares.length; squareIdx++)
			{
				currentRect = this.cloudsArray[cloudIdx].squares[squareIdx]
				push();
				translate(this.cloudsArray[cloudIdx].xPos, 0);
				fill(255);
				noStroke();
				rect(currentRect.x, currentRect.y, currentRect.size, currentRect.size)
				pop();
				noStroke();
				fill(255, 0, 0);
			}
		}
	}
}

//--------------------CARROT OBJECT--------------------//
carrots = 	
{
	innerColor: null,
	outerColor: null,

	setCarrotColors: function (innerColor, outerColor)
	{
		this.innerColor = innerColor;
		this.outerColor = outerColor;
	},

	carrot: function (x, y, s)
	{
		c = 
		{
			x: x,
			y: y,
			currentYPos: y,
			size: s,
			originalSize: s,
			downAnimation: true,
			beenCollected: false,
			carrotFloorPosY: y + (s * 185),
			inProximity: function (charX, charY)
			{
				carrotX = this.x
				carrotY = this.currentYPos + (10 * this.size)
				carrotRadius = this.size * 180
				return dist(carrotX, carrotY, charX, charY) < carrotRadius / 2

			},
			cloudData: {onCloud: false, cloudIdx: null}
		}
		return c
	},

	carrotArray: [],

	addCarrots: function (carrotsInput)
	{
		for(i = 0; i < carrotsInput.length; i++)
		{
			this.carrotArray.push(this.carrot(carrotsInput[i].xPos, carrotsInput[i].yPos + 15, carrotsInput[i].size))
		}
	},

	drawCarrots: function()
	{
		for(i = this.carrotArray.length - 1; i >= 0; i--)
		{
			//check if player is close to this carrot
			if(this.carrotArray[i].inProximity(rabbitCharacter.realWorldPos, rabbitCharacter.getCenterPos() - heightPos))
			{
				if(!this.carrotArray[i].beenCollected)
				{
					playSound("carrotCollected")
					collectedAnimations.addAnimation(this.carrotArray[i].x, this.carrotArray[i].carrotFloorPosY, color(255, 215, 0), color(218, 165, 32), this.carrotArray[i])
					statsBoard.addPoints(statsBoard.pointQuantities.carrot)
				}
				this.carrotArray[i].beenCollected = true;
			}

			//animate carrots if they haven't been collected
			if(this.carrotArray[i].downAnimation && !this.carrotArray[i].beenCollected)
			{
				if(this.carrotArray[i].currentYPos - this.carrotArray[i].y == 5)
				{
					this.carrotArray[i].downAnimation = false;
				}
				if(frameCount % 3 == 0)
				{
					this.carrotArray[i].currentYPos++;
				}
			}
			else if (!this.carrotArray[i].downAnimation && !this.carrotArray[i].beenCollected)
			{
				if(this.carrotArray[i].y - this.carrotArray[i].currentYPos == 5)
				{
					this.carrotArray[i].downAnimation = true;
				}
				if(frameCount % 3 == 0)
				{
					this.carrotArray[i].currentYPos--;
				}
			} 

			//animate the carrots once they are collected
			if(this.carrotArray[i].beenCollected)
			{
				if(this.carrotArray[i].originalSize * 2 > this.carrotArray[i].size)
				{
					this.carrotArray[i].size *= 1.012;
				}
				else
				{
					c = this.carrotArray[i]
					duration = 50 // controls duration in # of frames of collectables going to stats board
					statsBoard.carrotsToStatsArray.push({xPos: c.x + scrollPos, yPos: c.y + heightPos, size: c.size, lifeSpan: duration,
														xUpdate: abs(c.x - (statsBoard.carrotData.xPos - scrollPos)) / duration, yUpdate: abs((c.y + heightPos) - statsBoard.carrotData.yPos) / duration, sizeUpdate: (statsBoard.carrotData.size - c.size) / duration})
					this.carrotArray.splice(i, 1);
					continue;
				}
			}

			//draw the carrots to the canvas
			x = this.carrotArray[i].x
			y = this.carrotArray[i].currentYPos
			s = this.carrotArray[i].size

			noStroke();
			fill(this.innerColor);

			//main carrot
			push();
			translate(-(60 * s), 0)
			rect(x + (20 * s), y - (40 * s), 80 * s, 80 * s)
			rect(x, y, 60 * s, 60 * s)
			rect(x - (20 * s), y + (40 * s), 40 * s, 40 * s)
			
			//carrot stems
			push();
			translate(x + (80 * s), y - (30 * s), 20 * s, 20 * s);
			fill(this.outerColor);
			angleMode(DEGREES);
			rect(0, 0, 60 * s, 25 * s);
			rotate(-45);
			rect(0, -4 * s, 60 * s, 25 * s);
			rotate(-45);
			rect(-10 * s, -12.5 * s, 60 * s, 25 * s);
			pop();
			pop();
		}
	}
}

//--------------------DRAW TERRAIN--------------------//
drawTerrain = 
{
	currentPlatforms: null,

	drawRow: function(lightColor, darkColor, groundStart, groundEnd, yPos, generatedTerrain, maxHeight, size)
	{
		noStroke();
		density = size * 1.5

		while(groundStart < groundEnd)
		{
			xRandom = size/2
			yRandom = size/4
			widthRandom = [size - (size * 0.15), size + (size * 0.15)]
			heightRandom = [size - (size * 0.15), size + (size * 0.15)]
			
			// updates last square in the row so that it doesn't draw over row
			lastColumn = groundStart + density >= groundEnd

			currentX = groundStart

			if(lastColumn)
			{
				yPos += size / 2
				if(groundStart + density > groundEnd + size / 2)
				{
					currentX -= size / 2
				}
			}

			//draw the grass
			if(random(0, 1) < 0.5)
			{
				generatedTerrain.push({color: lightColor, 
									x: currentX + random(-xRandom, xRandom), 
									y: constrain(yPos + random(-yRandom, yRandom), maxHeight, height), 
									width: random(widthRandom[0], widthRandom[1]), 
									height: random(heightRandom[0], heightRandom[1])})
			}
			else
			{
				generatedTerrain.push({color: darkColor, 
									x: currentX + random(-xRandom, xRandom), 
									y: constrain(yPos + random(-yRandom, yRandom), maxHeight, height), 
									width: random(widthRandom[0], widthRandom[1]),
									height: random(heightRandom[0], heightRandom[1])})
			}

			groundStart += density;
		}
	},

	generateLayeredGround: function (grassLight, grassDark, dirtLight, dirtDark, bedRockLight, bedRockDark, yPos, groundPositions)
	{
		generatedGround = []

		maxHeight = yPos

		for(i = 0; i < groundPositions.length; i++)
		{
			currentGroundSection = groundPositions[i]
			groundStart = currentGroundSection[0]
			groundEnd = currentGroundSection[1]
			
			generatedGround.push({color: bedRockLight, x: groundStart, y: yPos, width: groundEnd - groundStart, height: 500});

			yPos += 100;
			this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);

			yPos -= 50;
			this.drawRow(dirtLight, dirtDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);

			yPos -= 50;
			this.drawRow(color(grassLight), grassDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);
		}
		
		return generatedGround
	},

	generateLayeredPlatforms: function (grassLight, grassDark, dirtLight, dirtDark, bedRockLight, bedRockDark, platformsInput)
	{

		this.currentPlatforms = platformsInput

		platforms = []
		for(i = 0; i < platformsInput.length; i++)
		{
			maxHeight = platformsInput[i].yPos
			updatedWidth = platformsInput[i].platformEnd - platformsInput[i].platformStart

			currentPlatform = [{color: dirtDark, x: platformsInput[i].platformStart, y: platformsInput[i].yPos, width: updatedWidth, height: 50}]

			this.drawRow(bedRockLight, bedRockDark, platformsInput[i].platformStart, platformsInput[i].platformEnd, platformsInput[i].yPos + 25, currentPlatform, maxHeight, 30)
			this.drawRow(dirtLight, dirtDark, platformsInput[i].platformStart, platformsInput[i].platformEnd, platformsInput[i].yPos + 15, currentPlatform, maxHeight, 30)
			this.drawRow(grassLight, grassDark, platformsInput[i].platformStart, platformsInput[i].platformEnd, platformsInput[i].yPos, currentPlatform, maxHeight, 30)

			platforms.push(currentPlatform)
		}
		return platforms
	},

	drawCurrentTerrain: function (currentGround, currentPlatforms)
	{
		this.updateFoxesOnGround()
		this.updateAnimalsOnPlatforms()

		for(rectIdx = 0; rectIdx < currentGround.length; rectIdx++)
		{
			noStroke();
			fill(currentGround[rectIdx].color)
			rect(currentGround[rectIdx].x, currentGround[rectIdx].y, currentGround[rectIdx].width, currentGround[rectIdx].height)
		}

		for(i = 0; i < currentPlatforms.length; i++)
		{
			for(j = 0; j < currentPlatforms[i].length; j++)
			{
				noStroke();
				fill(currentPlatforms[i][j].color)
				rect(currentPlatforms[i][j].x, currentPlatforms[i][j].y, currentPlatforms[i][j].width, currentPlatforms[i][j].height)
			}
		}
	},

	updateAnimalsOnPlatforms: function ()
	{
		for(platformIdx = 0; platformIdx < this.currentPlatforms.length; platformIdx++)
		{
			//check for whether character is on platforms
			gameCharXInRange = (rabbitCharacter.realWorldPos > this.currentPlatforms[platformIdx].platformStart &&
								rabbitCharacter.realWorldPos < this.currentPlatforms[platformIdx].platformEnd);


			platformY = this.currentPlatforms[platformIdx].yPos + heightPos

			gameCharYInRange = abs(rabbitCharacter.getFeetPos() - platformY) < 8

			onPlatform = gameCharXInRange && gameCharYInRange && rabbitCharacter.jumpingData.goingUpwards == false

			if(onPlatform && rabbitCharacter.isDead == false)
			{				
				rabbitCharacter.platformData.onPlatform = true;
				rabbitCharacter.onFloor = true;
				rabbitCharacter.platformData.currentPlatformData = platformIdx;
			}

			//check for whether foxes are on platforms
			for(caveIdx = 0; caveIdx < foxes.caves.length; caveIdx++)
			{
				for(foxIdx = foxes.caves[caveIdx].caveFoxesArray.length - 1; foxIdx >= 0; foxIdx--)
				{
					currentFox = foxes.caves[caveIdx].caveFoxesArray[foxIdx]

					foxXInRange = (currentFox.xPos > this.currentPlatforms[platformIdx].platformStart) &&
									(currentFox.xPos < this.currentPlatforms[platformIdx].platformEnd)

					foxYInRange = abs((currentFox.yPos + heightPos) - platformY) < 8

					onPlatform = foxXInRange && foxYInRange

					if(onPlatform && currentFox.isDead == false)
					{
						currentFox.movingData.platformData.onPlatform = true
						currentFox.movingData.platformData.platformIdx = platformIdx
						currentFox.isFalling = false

						if(random(0, 1) > 0.5 && currentFox.foxDirectionSet == false)
						{
							currentFox.direction = "left"
						}
						else if(currentFox.foxDirectionSet == false)
						{
							currentFox.direction = "right"
						}

						currentFox.foxDirectionSet = true
					}
				}
			}
		}
	},

	updateFoxesOnGround: function ()
	{
		//loop through all ground objects

		for(groundSectionIdx = 0; groundSectionIdx < levels[currentLevel].groundPositionsArray.length; groundSectionIdx++)
		{
			currentGroundStart = levels[currentLevel].groundPositionsArray[groundSectionIdx][0]
			currentGroundEnd = levels[currentLevel].groundPositionsArray[groundSectionIdx][1]

			//loop through caves and foxes to check if they're on the ground
			for(caveIdx = 0; caveIdx < foxes.caves.length; caveIdx++)
			{
				for(foxIdx = foxes.caves[caveIdx].caveFoxesArray.length - 1; foxIdx >= 0; foxIdx--)
				{
					currentFox = foxes.caves[caveIdx].caveFoxesArray[foxIdx]

					foxXInRange = (currentFox.xPos > currentGroundStart &&
									currentFox.xPos < currentGroundEnd)

					foxYInRange = abs((currentFox.yPos + heightPos) - (floorPos_y + heightPos)) < 8

					onGround = foxXInRange && foxYInRange


					if(onGround && currentFox.isDead == false)
					{
						currentFox.movingData.groundData.onGround = true
						currentFox.movingData.groundData.groundIdx = groundSectionIdx
						currentFox.isFalling = false

						if(random(0, 1) > 0.5 && currentFox.foxDirectionSet == false)
						{
							currentFox.direction = "left"
						}
						else if(currentFox.foxDirectionSet == false)
						{
							currentFox.direction = "right"
						}

						currentFox.foxDirectionSet = true
					}
				}
			}
		}
	}
}

//--------------------CHARACTER OBJECT--------------------//
rabbitCharacter = 
{
	realWorldPos: 0,
	xPos: null,
	yPos: null, 
	size: null,
	onFloor: true,
	isDead: false,

	setCharData: function ()
	{
		this.xPos = levels[currentLevel].characterXStart
		this.yPos = levels[currentLevel].characterYStart
		this.size = levels[currentLevel].characterSize
	},

	getFeetPos: function ()
	{
		return this.yPos + (215 * this.size)
	},

	getCenterPos: function ()
	{
		return this.yPos + (150 * this.size)
	},

	getHeadPos: function ()
	{
		return this.yPos + (75 * this.size)
	},

	userInput: {direction: "front", airCondition: "walking"},
	legData: 
	{
		//initialize character data used to control walking animation
		rightFootForward: true,
		backLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null,  innerLegHeight: null},
		frontLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null, innerLegHeight: null}
	},

	earRotationData:
	{
		currentlyRotating: false,
		earsGoingDown: true,
		currentRotationValue: 0
	},

	jumpingData:
	{
		currentlyJumping: false,
		goingUpwards: true,
		currentSpeed: 0,
		jumpingDuration: 100
	},

	checkOnGround: function ()
	{
		onFloor = abs(this.getFeetPos() - (floorPos_y + heightPos)) < 8

		if(onFloor && this.isDead == false)
		{
			rabbitCharacter.onFloor = true;
			rabbitCharacter.yPos = (floorPos_y - 111) + heightPos
		}
	},

	ridingCloudData:
	{
		onCloud: false,
		cloudRiding: null,
	},

	platformData:
	{
		onPlatform: false,
		currentPlatformData: null
	},

	drawRabbit: function()
	{
		s = this.size
		x = this.xPos
		y = this.yPos

		//keep rabbit yPos aligned with current platform
		if(this.onFloor && this.platformData.onPlatform)
		{
			platformHeight = drawTerrain.currentPlatforms[this.platformData.currentPlatformData].yPos + heightPos
			yDiffFromFeet = this.getFeetPos() - this.yPos
			this.yPos = platformHeight - yDiffFromFeet
		}

		//keep rabbit yPos aligned with current cloud
		if(this.onFloor && this.ridingCloudData.onCloud)
		{
			cloudHeight = clouds.cloudsArray[this.ridingCloudData.cloudRiding].yPos + heightPos + 60
			yDiffFromFeet = this.getFeetPos() - this.yPos
			this.yPos = cloudHeight - yDiffFromFeet
		}

		//check if rabbit is dead and draw rabbit accordingly
		if(this.isDead)
		{
			this.onFloor = false;
			this.userInput = {direction: "front", airCondition: "jumping"}
			this.yPos += 5;
			this.heightPos = 0;
		}
		
		//control cloud moving with char
		if(this.ridingCloudData.onCloud && this.isDead == false)
		{
			if(clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "right")
			{
				if(this.userInput.direction == "front")
				{
					if(this.xPos < levels[currentLevel].scrollPosRight)
					{
						this.xPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
					}
					else
					{
						scrollPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
					}	
				}
			}

			else if(clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "left")
			{
				if(this.userInput.direction == "front")
				{
					if(this.xPos > levels[currentLevel].scrollPosLeft)
					{
						this.xPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
					}
					else
					{
						scrollPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
					}					
				}
			}

			//make player fall off cloud if out of range
			gameCharXInRange = (this.realWorldPos > clouds.cloudsArray[this.ridingCloudData.cloudRiding].xPos + 15 &&
								this.realWorldPos < clouds.cloudsArray[this.ridingCloudData.cloudRiding].xPos + 175);

			if(gameCharXInRange == false)
			{
				this.ridingCloudData.onCloud = false;
				this.jumpingData.currentlyJumping = true;
				this.jumpingData.goingUpwards = false;
				this.userInput.airCondition = "jumping"
				this.onFloor = false;
			}
		}

		//make player fall off current platform if they're out of range
		if(this.platformData.onPlatform)
		{
			gameCharXInRange = (rabbitCharacter.realWorldPos > drawTerrain.currentPlatforms[this.platformData.currentPlatformData].platformStart &&
							rabbitCharacter.realWorldPos < drawTerrain.currentPlatforms[this.platformData.currentPlatformData].platformEnd);
		
			if(gameCharXInRange == false)
			{
				this.platformData.onPlatform = false;
				this.jumpingData.currentlyJumping = true;
				this.jumpingData.goingUpwards = false;
				this.userInput.airCondition = "jumping"
				this.onFloor = false;
			}
		}


		//control ears when jumping
		if(this.earRotationData.currentlyRotating)
		{
			if(this.earRotationData.earsGoingDown)
			{
				if(this.earRotationData.currentRotationValue == 100)
				{
					this.earRotationData.earsGoingDown = false;
				}
				else
				{
					this.earRotationData.currentRotationValue += 5;
				}
				
			}
			else
			{
				if(this.earRotationData.currentRotationValue == 0)
				{
					this.earRotationData.earsGoingDown = true;
					this.earRotationData.currentlyRotating = false;
				}
				else
				{
					this.earRotationData.currentRotationValue -= 2;
				}
			}
		}

		//control jumping animation
		if(this.jumpingData.currentlyJumping)
		{	
			this.jumpingData.jumpingDuration -= 2
			if(this.jumpingData.goingUpwards)
			{
				if(this.getCenterPos() < levels[currentLevel].heightPosTop)
				{
					heightPos += this.jumpingData.currentSpeed
				}
				else
				{
					this.yPos -= this.jumpingData.currentSpeed
				}
				if(this.jumpingData.jumpingDuration == 0)
				{
					this.jumpingData.goingUpwards = false;
					this.jumpingData.jumpingDuration = 100;
				}
				else
				{
					this.jumpingData.currentSpeed = map(this.jumpingData.jumpingDuration * 1.5, 2 * 1.5, 100 * 1.5, 0, 10)
				}
			}
			else if(this.isDead == false)
			{
				if(this.getCenterPos() > levels[currentLevel].heightPosBottom && this.onFloor == false)
				{
					heightPos -= this.jumpingData.currentSpeed
				}
				else
				{
					this.yPos += this.jumpingData.currentSpeed
				}
				this.checkOnGround()
				if(this.onFloor)
				{
					this.jumpingData.currentlyJumping = false;
					this.jumpingData.jumpingDuration = 100;
					this.jumpingData.currentSpeed = 0;
					this.jumpingData.goingUpwards = true;
					this.userInput.airCondition = "walking";
				}
				else
				{
					this.jumpingData.currentSpeed = map((100 - this.jumpingData.jumpingDuration) * 1.5, 2 * 1.5, 100 * 1.5, 0, 10)
				}
	
			}
		}
	

		//control walking animation
		if(this.legData.rightFootForward == true && frameCount % 7 == 0)
		{
			this.legData.backLegs.outerLegHeight = 28 * s;
			this.legData.backLegs.innerLegHeight = 34 * s;
			this.legData.frontLegs.outerLegHeight = 34 * s;
			this.legData.frontLegs.innerLegHeight = 28 * s;
			this.legData.rightFootForward = false;
		}
		else if(this.legData.rightFootForward == false && frameCount % 7 == 0)
		{
			this.legData.backLegs.outerLegHeight = 34 * s;
			this.legData.backLegs.innerLegHeight = 28 * s;
			this.legData.frontLegs.outerLegHeight = 28 * s;
			this.legData.frontLegs.innerLegHeight = 34 * s;
			this.legData.rightFootForward = true;
		}
	
		//control graphics of character
		if(this.userInput.direction == "right")
		{	
			if(this.xPos < levels[currentLevel].scrollPosRight)
			{
				this.xPos += 4;

				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "right")
				{
					this.xPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}
			else
			{
				scrollPos -= 4;
				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "right")
				{
					scrollPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}
			stroke(0); //black outline color
			strokeWeight(4 * s); //black outline width
			fill(255); // white color
			
			//main body part 1/2
			rect(x - (58 * s), y + (165 * s), 20 * s, 20 * s); //tail
			rect(x - (45 * s), y + (150 * s), 90 * s, 60 * s); //body
			//legs
			if(this.userInput.airCondition == "walking")
			{
				rect(x - (35 * s), y + (190 * s), 15 * s, this.legData.backLegs.innerLegHeight);
				rect(x - (45 * s), y + (190 * s), 15 * s, this.legData.backLegs.outerLegHeight);
				rect(x + (30 * s), y + (190 * s), 15 * s, this.legData.frontLegs.innerLegHeight);
				rect(x + (20 * s), y + (190 * s), 15 * s, this.legData.frontLegs.outerLegHeight);
				noStroke();
				rect(x - (43 * s), y + (152 * s), 86 * s, 56 * s); //body white inner rect (covers black outline of legs)
			}
			else if(this.userInput.airCondition == "jumping")
			{
				// rect(x - (35 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x - (45 * s), y + (190 * s), 15 * s, 15 * s);
				// rect(x + (30 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x + (20 * s), y + (190 * s), 15 * s, 15 * s);
			}
			
			stroke(0);
			strokeWeight(4 * s);

			push();
			translate(x + (10 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of left ear (for rotation)
			angleMode(DEGREES);
			rotate(-this.earRotationData.currentRotationValue);
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //left ear
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(0, -(25 * s), 5 * s, 20 * s); //left inner ear
			pop();

			push();
			translate(x + (45 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of right ear (for rotation)
			angleMode(DEGREES);
			rotate(this.earRotationData.currentRotationValue);
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //right ear
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(0, -(25 * s), 5 * s, 20 * s);  //right inner ear
			pop();

			//main body part 2/2
			rect(x, y + (120 * s), 70 * s, 60 * s); //head
			rect(x + (30 * s), y + (140 * s), 2 * s, 20 * s); //left eye
			rect(x + (55 * s), y + (140 * s), 2 * s, 20 * s); //right eye

			//pink elements
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(x + (44 * s), y + (169 * s), 1 * s, 1 * s); //mouth
			fill(255, 0, 0);
		}
		else if(this.userInput.direction == "left")
		{
			if(this.xPos > levels[currentLevel].scrollPosLeft)
			{
				this.xPos -= 4;

				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "left")
				{
					this.xPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}
			else
			{
				scrollPos += 4;
				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "left")
				{
					scrollPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}
			stroke(0); //black outline color
			strokeWeight(4 * s); //black outline width
			fill(255); // white color
			
			//main body part 1/2
			rect(x + (38 * s), y + (165 * s), 20 * s, 20 * s); //tail
			rect(x - (45 * s), y + (150 * s), 90 * s, 60 * s); //body
			//legs
			if(this.userInput.airCondition == "walking")
			{
				rect(x - (35 * s), y + (190 * s), 15 * s, this.legData.backLegs.innerLegHeight);
				rect(x - (45 * s), y + (190 * s), 15 * s, this.legData.backLegs.outerLegHeight);
				rect(x + (30 * s), y + (190 * s), 15 * s, this.legData.frontLegs.innerLegHeight);
				rect(x + (20 * s), y + (190 * s), 15 * s, this.legData.frontLegs.outerLegHeight);
				noStroke();
				rect(x - (43 * s), y + (152 * s), 86 * s, 56 * s); //body white inner rect (covers black outline of legs)
			}
			else if(this.userInput.airCondition == "jumping")
			{
				// rect(x - (35 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x - (45 * s), y + (190 * s), 15 * s, 15 * s);
				// rect(x + (30 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x + (20 * s), y + (190 * s), 15 * s, 15 * s);
			}
			stroke(0);
			strokeWeight(4 * s);

			push();
			translate(x - (30 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of left ear (for rotation)
			angleMode(DEGREES);
			rotate(this.earRotationData.currentRotationValue);
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //left ear
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(0, -(25 * s), 5 * s, 20 * s); //left inner ear
			pop();

			push();
			translate(x - (65 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of right ear (for rotation)
			angleMode(DEGREES);
			rotate(-this.earRotationData.currentRotationValue);
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //right ear
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(0, -(25 * s), 5 * s, 20 * s);  //right inner ear
			pop();

			//main body part 2/2
			rect(x - (70 * s), y + (120 * s), 70 * s, 60 * s); //head
			rect(x - (32 * s), y + (140 * s), 2 * s, 20 * s); //left eye
			rect(x - (57 * s), y + (140 * s), 2 * s, 20 * s); //right eye

			//pink elements
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(x - (45 * s), y + (169 * s), 1 * s, 1 * s); //mouth
			fill(255, 0, 0);
		}
		else if(this.userInput.direction == "front")
		{
			stroke(0); //black outline color
			strokeWeight(4 * s); //black outline width
			fill(255); // white color

			push();
			translate(x - (25 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of left ear (for rotation)
			angleMode(DEGREES);
			rotate(-this.earRotationData.currentRotationValue);
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //left ear
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(0, -(25 * s), 5 * s, 20 * s); //left inner ear
			pop();

			push();
			translate(x + (8 * s) + ((20 * s) / 2), 
					y + (80 * s) + (40 * s)); //center of right ear (for rotation)
			angleMode(DEGREES);
			rotate(this.earRotationData.currentRotationValue);
			rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //right ear
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(0, -(25 * s), 5 * s, 20 * s);  //right inner ear
			pop();
			if (this.userInput.airCondition == "walking")
			{
				//main body
				rect(x - (20 * s), y + (150 * s), 45 * s, 70 * s); //body
				rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head
				rect(x - (15 * s), y + (140 * s), 2 * s, 20 * s); //left eye
				rect(x + (15 * s), y + (140 * s), 2 * s, 20 * s); //right eye

				//legs
				rect(x - (35 * s), y + (200 * s), 15 * s, 20 * s); // front left leg
				rect(x + (25 * s), y + (190 * s), 15 * s, 30 * s); // front right leg
				rect(x + (2 * s), y + (195 * s), 0 * s, 25 * s); // leg in middle
				rect(x + (33 * s), y + (188 * s), 15 * s, 15 * s); //tail
			}
			else if (this.userInput.airCondition == "jumping")
			{
				//main body
				rect(x - (22.5 * s), y + (150 * s), 45 * s, 70 * s); //body
				rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head

				if(this.isDead)
				{
					//left eye (1/2)
					push();
					angleMode(DEGREES);
					translate(x - (25 * s), y + (145 * s));
					rotate(-45);
					rect(0, 0, 2 * s, 20 * s);
					pop();

					//left eye (2/2)
					push();
					angleMode(DEGREES);
					translate(x - (10 * s), y + (143 * s));
					rotate(45);
					rect(0, 0, 2 * s, 20 * s);
					pop();

					//right eye (1/2)
					push();
					angleMode(DEGREES);
					translate(x + (10 * s), y + (145 * s));
					rotate(-45);
					rect(0, 0, 2 * s, 20 * s);
					pop();

					//right eye (2/2)
					push();
					angleMode(DEGREES);
					translate(x + (25 * s), y + (143 * s));
					rotate(45);
					rect(0, 0, 2 * s, 20 * s);
					pop();
				}
				else
				{
					rect(x - (15 * s), y + (140 * s), 2 * s, 20 * s); //left eye
					rect(x + (15 * s), y + (140 * s), 2 * s, 20 * s); //right eye
				}
				
				//front legs
				rect(x - (35 * s), y + (190 * s), 20 * s, 20 * s); // front left leg
				rect(x + (15 * s), y + (190 * s), 20 * s, 20 * s); // front right leg
			}

			//pink elements
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(x + (1 * s), y + (169 * s), 1 * s, 1 * s); //mouth
			fill(255, 0, 0);
		}
	}
}

//--------------------ENEMIES OBJECT--------------------//
enemies = 
{

	enemyColors: 
	{
		hatTop: null,
		hatBottom: null,
		gunTop: null,
		gunBottom: null,
		innerFoot: null,
		outerFoot: null,
		body: null,
		face: null,
		bulletColor: null
	},

	createEnemy: function (xPos, yPos, scale, firingFrequency, firingSpeed, maxBulletDistLeft, maxBulletDistRight, maxBulletDistIsX)
	{
		e = 
		{
			xPos: xPos,
			yPos: yPos,
			isDead: false,
			scale: scale,
			direction: null,
			firingFrequency: firingFrequency,
			firingSpeed: firingSpeed,
			maxBulletDistLeft: maxBulletDistLeft,
			maxBulletDistRight: maxBulletDistRight,
			maxBulletDistIsX: maxBulletDistIsX,
			cloudData: {onCloud: false, cloudIdx: null}
		}
		return e
	},

	enemiesArray: [],

	addEnemies: function (enemiesInput)
	{
		for(newEnemyIdx = 0; newEnemyIdx < enemiesInput.length; newEnemyIdx++)
		{
			enemyInput = enemiesInput[newEnemyIdx]
			e = this.createEnemy(enemyInput.xPos, enemyInput.yPos, enemyInput.scale, enemyInput.firingFrequency, enemyInput.firingSpeed, enemyInput.maxBulletDistLeft, enemyInput.maxBulletDistRight, enemyInput.maxBulletDistIsX)
			this.enemiesArray.push(e)
			e.direction = this.checkEnemyDirection(this.enemiesArray.length - 1)

		}
	},

	drawEnemies: function ()
	{
		for(enemyIdx = this.enemiesArray.length - 1; enemyIdx >= 0; enemyIdx --)
		{
			enemy = this.enemiesArray[enemyIdx]

			//check for whether enemy has been killed
			if(this.checkDeadEnemy(enemyIdx))
			{
				enemy.isDead = true
				statsBoard.addPoints(statsBoard.pointQuantities.enemy)
			}

			//draw enemy dead animation and control removing enemy from the array
			if(enemy.isDead)
			{
				enemy.yPos += 8;
				if(enemy.yPos > resizeCanvasData.currentHeight)
				{
					this.enemiesArray.splice(enemyIdx, 1)
				}
			}

			fill(255);

			//update enemy direction
			if(enemy.isDead == false)
			{
				enemy.direction = this.checkEnemyDirection(enemyIdx)
			}
			
			if(enemy.direction == "right")
			{
				s = enemy.scale

				//right shooter
				fill(this.enemyColors.innerFoot)
				rect(enemy.xPos - (20 * s), enemy.yPos + (15 * s), 12 * s, 25 * s) // inner foot
				fill(this.enemyColors.body)
				rect(enemy.xPos - (20 * s), enemy.yPos - (30 * s), 40 * s, 60 * s) // main body
				fill(this.enemyColors.outerFoot)
				rect(enemy.xPos + (10 * s), enemy.yPos + (15 * s), 15 * s, 25 * s) // outer foot

				fill(this.enemyColors.face)
				rect(enemy.xPos - (14 * s), enemy.yPos - (50 * s), 28 * s, 20 * s) // head
				fill(this.enemyColors.hatBottom)
				rect(enemy.xPos - (32 * s), enemy.yPos - (59 * s), 60 * s, 9 * s) // hat brim
				fill(this.enemyColors.hatTop)
				rect(enemy.xPos - (14 * s), enemy.yPos - (70 * s), 28 * s, 11 * s) // hat top

				fill(this.enemyColors.gunBottom)
				rect(enemy.xPos - (14 * s), enemy.yPos - (7 * s), 16 * s, 10 * s) // gun handle
				fill(this.enemyColors.gunTop)
				rect(enemy.xPos - (30 * s), enemy.yPos - (15 * s), 65 * s, 9 * s) // gun barrel
			}
			else if(enemy.direction == "left")
			{
				s = enemy.scale

				//left shooter
				fill(this.enemyColors.innerFoot)
				rect(enemy.xPos + (8 * s), enemy.yPos + (15 * s), 12 * s, 25 * s) // inner foot
				fill(this.enemyColors.body)
				rect(enemy.xPos - (20 * s), enemy.yPos - (30 * s), 40 * s, 60 * s) // main body
				fill(this.enemyColors.outerFoot)
				rect(enemy.xPos - (25 * s), enemy.yPos + (15 * s), 15 * s, 25 * s) // outer foot

				fill(this.enemyColors.face)
				rect(enemy.xPos - (14 * s), enemy.yPos - (50 * s), 28 * s, 20 * s) // head
				fill(this.enemyColors.hatBottom)
				rect(enemy.xPos - (28 * s), enemy.yPos - (59 * s), 60 * s, 9 * s) // hat brim
				fill(this.enemyColors.hatTop)
				rect(enemy.xPos - (14 * s), enemy.yPos - (70 * s), 28 * s, 11 * s) // hat top

				fill(this.enemyColors.gunBottom)
				rect(enemy.xPos - (2 * s), enemy.yPos - (7 * s), 16 * s, 10 * s) // gun handle
				fill(this.enemyColors.gunTop)
				rect(enemy.xPos - (35 * s), enemy.yPos - (15 * s), 65 * s, 9 * s) // gun barrel
	
			}

			//shoot bullets
			if(frameCount % enemy.firingFrequency == 0 && enemy.isDead == false)
			{
				if(enemy.maxBulletDistIsX)
				{
					this.bullets.addBullet(enemy.xPos, enemy.yPos - 10, enemy.scale, enemy.direction, enemy.firingSpeed, enemy.maxBulletDistLeft, enemy.maxBulletDistRight)
				}
				else
				{
					this.bullets.addBullet(enemy.xPos, enemy.yPos - 10, enemy.scale, enemy.direction, enemy.firingSpeed, enemy.xPos - enemy.maxBulletDistLeft, enemy.xPos + enemy.maxBulletDistRight)
				}
			}
		}
	},

	checkDeadEnemy: function (enemyIdx)
	{
		fill(255, 0, 0)

		enemyInRange = dist(this.enemiesArray[enemyIdx].xPos, this.enemiesArray[enemyIdx].yPos - 60, rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos() - heightPos) < levels[currentLevel].bulletInRangeValue

		if(enemyInRange && rabbitCharacter.jumpingData.goingUpwards == false)
		{
			rabbitCharacter.earRotationData.currentlyRotating = true;
			rabbitCharacter.jumpingData.goingUpwards = true;
			rabbitCharacter.jumpingData.jumpingDuration = 100
			rabbitCharacter.userInput.airCondition = "jumping"

			//update scoreboard
			statsBoard.score += 100
			statsBoard.enemies.thisLevel += 1;
			statsBoard.enemies.totalKilled += 1;

			return true
		}
		return false
	},

	checkEnemyDirection: function (enemyIdx)
	{
		if(rabbitCharacter.realWorldPos < this.enemiesArray[enemyIdx].xPos)
		{
			return "left"
		}
		return "right"
	},

	bullets:
	{
		createBullet: function (xPos, yPos, scale, direction, speed, maxDistLeft, maxDistRight)
		{
			b = 
			{
				xPos: xPos,
				yPos: yPos,
				scale: scale,
				direction: direction,
				speed: speed,
				maxDistLeft: maxDistLeft,
				maxDistRight: maxDistRight
			}
			return b
		},

		bulletsArray: [],

		checkContact: function (bulletX, bulletY)
		{
			if(dist(bulletX, bulletY, rabbitCharacter.realWorldPos, rabbitCharacter.getCenterPos() - heightPos) < 20)
			{
				return true
			}
			return false
		},

		addBullet: function (xPos, yPos, scale, direction, firingSpeed, maxDistLeft, maxDistRight)
		{
			b = this.createBullet(xPos, yPos, scale, direction, firingSpeed, maxDistLeft, maxDistRight)
			this.bulletsArray.push(b)
		},

		drawBullets: function ()
		{
			for(bulletIdx = this.bulletsArray.length - 1; bulletIdx >= 0; bulletIdx--)
			{
				bullet = this.bulletsArray[bulletIdx]

				//check if bullets are in contact
				if(this.checkContact(bullet.xPos, bullet.yPos))
				{
					rabbitCharacter.isDead = true;
					this.bulletsArray.splice(bulletIdx, 1) 
				}

				fill(255, 0, 0);
				

				//update bullet position
				if(bullet.direction == "right")
				{
					bullet.xPos += bullet.speed
					fill(enemies.enemyColors.bulletColor)
					ellipse(bullet.xPos, bullet.yPos, 12 * bullet.scale, 12 * bullet.scale) // bullet round
					rect(bullet.xPos - 13, bullet.yPos - (6 * bullet.scale), 12 * bullet.scale, 12 * bullet.scale) // bullet rect 

				}
				else if(bullet.direction == "left")
				{
					bullet.xPos -= bullet.speed
					fill(enemies.enemyColors.bulletColor)
					ellipse(bullet.xPos, bullet.yPos, 12 * bullet.scale, 12 * bullet.scale,) // bullet round
					rect(bullet.xPos, bullet.yPos - (6 * bullet.scale), 12 * bullet.scale, 12 * bullet.scale) // bullet rect 
				}
			}
		},

		updateExpiredBullets: function ()
		{
			for(bulletIdx = this.bulletsArray.length - 1; bulletIdx >= 0; bulletIdx--)
			{
				bullet = this.bulletsArray[bulletIdx]
				direction = bullet.direction
				if(direction == "left" && bullet.xPos < bullet.maxDistLeft)
				{
					this.bulletsArray.splice(bulletIdx, 1)
				}
				else if(direction == "right" && bullet.xPos > bullet.maxDistRight)
				{
					this.bulletsArray.splice(bulletIdx, 1) 
				}
			}
		}

	}
}

//--------------------COLLECTED ANIMATION OBJECT (BEAM SHOOTS UP)--------------------//
collectedAnimations =
{
	activeAnimations: [],

	addAnimation: function(xPos, yPos, rectOneColor, rectTwoColor, animationObj)
	{
		animation = 
		{
			xPos: xPos,
			yPos: yPos,
			rectOneHeight: 20,
			rectTwoHeight: 0,
			rectOneWidth: 10,
			rectTwoWidth: 0,
			rectOneColor: rectOneColor,
			rectTwoColor: rectTwoColor,
			lifeTime: 60,
			animationObj: animationObj
		};
		this.activeAnimations.push(animation);
	},

	animateAnimations: function ()
	{
		noStroke();
		for(i = this.activeAnimations.length - 1; i >= 0; i--)
		{			

			animation = this.activeAnimations[i];
			animation.rectOneHeight += 40;
			animation.rectOneWidth += 2;

			animation.xPos = animation.animationObj.x

			if(animation.rectOneHeight > 200)
			{
				animation.rectTwoHeight = animation.rectOneHeight;
				animation.rectTwoWidth += 4;
			}

			fill(animation.rectTwoColor);
			rect(animation.xPos - (animation.rectTwoWidth / 2),
				animation.yPos - animation.rectTwoHeight,
				animation.rectTwoWidth,
				animation.rectTwoHeight);

			fill(animation.rectOneColor);
			rect(animation.xPos - (animation.rectOneWidth / 2),
				animation.yPos - animation.rectOneHeight,
				animation.rectOneWidth,
				animation.rectOneHeight);

			if(animation.lifeTime < 0)
			{
				this.activeAnimations.splice(i, 1)
			}
			else
			{
				animation.lifeTime -= 1;

			}
		}
	}
}



function keyPressed()
{

	if(gameLoopSound.isPlaying() == false)
	{
		gameLoopSound.loop() //starts game sound
	}

    //left arrow
	if(keyCode == 37)
    {
        rabbitCharacter.userInput.direction = "left";
    }
    //right arrow
    else if(keyCode == 39)
    {
        rabbitCharacter.userInput.direction = "right";
    }
	//space bar
    if (keyCode == 32 && rabbitCharacter.userInput.airCondition == "walking")
    {
		if(rabbitCharacter.ridingCloudData.onCloud || rabbitCharacter.platformData.onPlatform)
		{
			rabbitCharacter.platformData.onPlatform = false;
			rabbitCharacter.ridingCloudData.onCloud = false;
		}
		rabbitCharacter.earRotationData.currentlyRotating = true;
        rabbitCharacter.jumpingData.currentlyJumping = true;
		rabbitCharacter.userInput.airCondition = "jumping"
		rabbitCharacter.onFloor = false;
    }
}

function keyReleased()
{
    
    //left arrow
    if(keyCode == 37)
    {
        rabbitCharacter.userInput.direction = "front";
    }
    //right arrow
    else if(keyCode == 39)
    {
        rabbitCharacter.userInput.direction = "front";
    }
}

//--------------------LOG FRAMERATE HELPER FUNCTION--------------------//

function logFrameRate(lessThan, greaterThan)
{
	fR = round(frameRate())
	if(fR >= lessThan && fR <= greaterThan)
	{
		console.log(lessThan + " - " + greaterThan)
	}
	else if (fR < lessThan)
	{
		console.log("< " + lessThan)
	}
	else if (fR > greaterThan)
	{
		console.log("> " + greaterThan)
	}
}

//--------------------OUT OF BOUNDS HELPER FUNCTION--------------------//
function checkOutOfBounds()
{
	groundCords = levels[currentLevel].groundPositionsArray
	groundStart = groundCords[0][0]
	groundEnd = groundCords[groundCords.length - 1][1]

	yInRange = ((abs(rabbitCharacter.getFeetPos() - (floorPos_y + heightPos)) < 8) || rabbitCharacter.getFeetPos > floorPos_y)
	xInRange = (rabbitCharacter.realWorldPos < groundStart || rabbitCharacter.realWorldPos > groundEnd)


	if(yInRange && xInRange && statsBoard.deathHandled == false)
	{
		rabbitCharacter.isDead = true;
	} 
}

//--------------------RESIZE WINDOW FUNCTION--------------------//
function windowResized() {
	resizeCanvasData.currentWidth = windowWidth
	resizeCanvasData.yCanvasTranslate += (windowHeight - resizeCanvasData.currentHeight)
	resizeCanvasData.currentHeight = windowHeight
	updateCanvasData()
	messages.updateMessageDimensions()
	resizeCanvas(windowWidth, windowHeight);
}

//--------------------CONTROLS BUTTONS--------------------//
function mousePressed()
{
	if(messages.onRestartButton(mouseX, mouseY) && messages.drawMessageBool == true)
	{
		currentLevel = 0;
		statsBoard.children.current = 0;
		child.drawChildBool = true,
		child.isFound =  false,
		startGame()
	}
}

//--------------------CONTROLS SOUND EVENTS--------------------//
function playSound(event)
{
	if(event == "carrotCollected")
	{
		carrotCollectedSound.play()
	}
	else if(event == "lifeCollected")
	{
		lifeCollectedSound.play()
	}
}
