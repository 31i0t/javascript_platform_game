//global vars
var floorPos_y;
var currentGround;
var scrollPos;
var heightPos;
var currentLevel;
var NESfont;
var carrotCollectedSound;
var gameLoopSound;
var currentFrameRate = 0;
var editingMode;

function preload()
{
	NESfont = loadFont('assets/fonts/NESfont.ttf')
	
	carrotCollectedSound = loadSound('assets/sounds/carrotCollected.mp3')
	lifeCollectedSound = loadSound('assets/sounds/heartCollected.mp3')
	gameLoopSound = loadSound('assets/sounds/gameLoop.wav')

}

function setup()
{
	editingMode = false
	currentLevel = 0
	createCanvas(windowWidth, windowHeight);
	resizeCanvasData.currentWidth = windowWidth
	resizeCanvasData.currentHeight = windowHeight
	resizeCanvasData.yCanvasTranslate = 0
	resizeCanvasData.yObjStart = (resizeCanvasData.currentHeight * 3/4) - 432
	gameOver.updateMessageDimensions()
	floorPos_y = height * 3/4;
	statsBoard.updateTotals()
	updateYObjStart()

	startGame();
	
}

function startGame()
{
	level = levels[currentLevel]

	scrollPos = level.characterXStartScrollPos;
	heightPos = level.characterYStartHeightPos;
	
	respawn()
	
	carrots.carrotArray = [];
	lives.heartsArray = [];
	clouds.cloudsArray = [];
	canyons.canyonsArray = [];
	enemies.enemiesArray = [];
	foxes.caves = [];
	powerups.powerupsArray = [];
	birds.clusters = [];
	statsBoard.score = 0;
	statsBoard.lives.current = 1;
	statsBoard.enemies.totalKilled = 0;
	statsBoard.carrots.totalCollected = 0;

	frameRate(120)

	updateCanvasData()

	statsBoard.updateCurrentLevel()
	levelText = level.levelText

	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;
	foxes.addCaves(level.cavesData)

	messages.addMessages(level.messagesData)
	birds.settings = {startingLeft: -100, startingRight: resizeCanvasData.currentWidth + 100, frequency: 5, clusterSpeed: 5, flapSpeed: 8, xRandom: 100, yRandom: 150, numOfBirds: 30, scale: 0.2}
	birds.generateBirdClusters([{yPos: 300}, {yPos: 600}])

	skyColor = color(level.skyColor);
	carrots.setCarrotColors(color(level.carrotColor), color(level.carrotStemColor),)
	carrotsArray = level.carrotPositionsArray
	carrots.addCarrots(carrotsArray)
	lives.color = color(level.livesColor)
	heartsArray = level.heartPositionsArray
	lives.addHearts(heartsArray)
	powerupsArray = level.powerupPositionsArray
	powerups.addPowerups(powerupsArray)
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


	statsBoard.handlePlayerDeath()
	
	push();
	translate(0, resizeCanvasData.yCanvasTranslate)

	background(levels[currentLevel].skyColor);
	push();
    translate(scrollPos, heightPos);
	mountains.drawMountains()
	push();
	//draw birds plainly
	translate(-scrollPos, -(heightPos + resizeCanvasData.yCanvasTranslate))
	birds.drawBirdClusters()
	pop();
	trees.drawTrees()
	canyons.drawCanyons();
	drawTerrain.drawCurrentTerrain(currentGround, currentPlatforms)
	collectedAnimations.animateAnimations()
	clouds.drawClouds();
	enemies.bullets.updateExpiredBullets()
	enemies.bullets.drawBullets()
	enemies.drawEnemies()
	foxes.updateFoxes()
	foxes.drawCaves()
	foxes.drawFoxes()
	pop();

	rabbitCharacter.drawRabbit()
	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;
	animatePointsCollected.animateActiveAnimations()
	powerups.updatePowerups()

	//draw collectables in front of character
	push();
    translate(scrollPos, heightPos);
	carrots.drawCarrots();
	child.drawChild();
	lives.drawHearts();
	powerups.drawPowerups()
	powerups.drawPowerupsToChar()
	pop();

	checkOutOfBounds()

	logFrameRate()
	
	pop();
	
	statsBoard.drawBoard(levelText)
	statsBoard.drawCarrotsToStats()
	statsBoard.drawHeartsToStats()
	statsBoard.drawChildrenToStats()
	birds.updateBirdFlapping()
	birds.updateClusterRespawn()
	birds.updateBoundaries()

	//draw messages in front of stats board
	push();
	translate(scrollPos, resizeCanvasData.yCanvasTranslate + heightPos);
	messages.drawMessages()
	pop();



	if(gameOver.drawMessageBool){gameOver.drawMessage()}

	
}

//objects
//--------------------HANDLES RESPAWNING (NOT DEATH)--------------------//

function respawn()
{	

	rabbitCharacter.yPos = levels[currentLevel].characterYStart + heightPos 
	rabbitCharacter.userInput = {direction: "front", airCondition: "walking"};
	rabbitCharacter.xPos = levels[currentLevel].characterXStart
	rabbitCharacter.size = levels[currentLevel].characterSize


	rabbitCharacter.realWorldPos = levels[currentLevel].characterXStart
	rabbitCharacter.platformData.onPlatform = false;
	rabbitCharacter.ridingCloudData.onCloud = false;
	rabbitCharacter.jumpingData.jumpingDuration = rabbitCharacter.jumpingData.resetJumpDuration
	rabbitCharacter.onFloor = true

	

	//disable powerups
	powerups.deactivatePowerups("both")

	gameOver.drawMessageBool = false;
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
gameOver = 
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

//--------------------CONTROLS MESSAGES--------------------//
messages =
{

	messagesArray: [],

	createMessage: function(circleX, circleY, circleRadius, scale, messages)
	{
		m = 
		{
			circleX: circleX,
			circleY: circleY,
			originalX: circleX,
			originalY: circleY,
			circleRadius: circleRadius,
			originalRadius: circleRadius,
			borderRadius: circleRadius / 2,
			expanding: false,
			scale: scale,
			messages: messages
		}
		return m
	},

	addMessages: function(messagesInput)
	{
		for(i = 0; i < messagesInput.length; i++)
		{
			currentMessage = messagesInput[i]
			m = this.createMessage(currentMessage.circleX, currentMessage.circleY, currentMessage.circleRadius, currentMessage.scale, currentMessage.messages)
			this.messagesArray.push(m)
		}
	},

	drawMessages: function ()
	{
		for(i = 0; i < this.messagesArray.length; i++)
		{
			m = this.messagesArray[i]


			//check to see if character is near message
			if(dist(rabbitCharacter.realWorldPos, rabbitCharacter.yPos + heightPos, m.originalX, m.originalY) < (m.originalRadius * 2))
			{
				m.expanding = true
			}
			else
			{
				m.expanding = false
			}

			//animate or expand message based on expanding bool
			decreaseborderCap = m.originalRadius * 0.2
			decreaseBorderRate = 0.975
			increaseHeightCap = (m.originalRadius * 7)
			increaseHeightRate = m.originalRadius/6
			increaseSizeCap = m.originalRadius * 6
			increaseSizeRate = 1.047
			if(m.expanding)
			{
				//update radius
				if(m.borderRadius > decreaseborderCap)
				{
					m.borderRadius *= decreaseBorderRate
				}
				//update height
				if(m.circleY > m.originalY - increaseHeightCap)
				{
					m.circleY -= increaseHeightRate
				}
				//update size
				if(m.circleRadius < increaseSizeCap)
				{
					m.circleRadius *= increaseSizeRate
				}
			}
			else
			{
				//update radius
				if(m.borderRadius < (m.originalRadius / 2))
				{
					m.borderRadius *= 1 + (1 - decreaseBorderRate)
				}
				else
				{
					m.borderRadius = m.circleRadius / 2
				}
				//update height
				if(m.circleY < m.originalY)
				{
					m.circleY += increaseHeightRate
				}
				else
				{
					m.circleY = m.originalY
				}
				//update size
				if(m.circleRadius > m.originalRadius)
				{
					m.circleRadius *= 1 + (1 - increaseSizeRate)
				}
				else
				{
					m.circleRadius = m.originalRadius
				}
			}

			x = m.circleX - (m.circleRadius * 0.5)
			y = m.circleY - (m.circleRadius * 0.5)

			fill(color(this.backgroundColor))
			stroke(this.strokeColor)
			strokeWeight(m.originalRadius / 15)
			rect(x, y, m.circleRadius, m.circleRadius, m.borderRadius)

			//draw out messages
			currentMessage = m.messages

			for(lineIdx = 0; lineIdx < currentMessage.length; lineIdx++)
			{
				currentLine = currentMessage[lineIdx]
				if(m.circleRadius == m.originalRadius)
				{
					fill(0, 0, 0)
					noStroke();
					textSize(m.circleRadius * 0.7)
					textAlign(CENTER);
					text("?", m.originalX + (m.originalRadius / 14), m.originalY + (m.originalRadius / 4))
				}
				else
				{
					push();
					noStroke();
					translate(m.circleX, m.circleY)
					currentOpacity = constrain(map(m.circleRadius, m.originalRadius, increaseSizeCap, -200, 255), 0, 255)
					fill(currentLine.textColor[0], currentLine.textColor[1], currentLine.textColor[2], currentOpacity)
					textSize(m.circleRadius * 0.1)
					textAlign(CENTER);


					currentMessageY = map(m.circleY, m.originalY, increaseHeightCap - m.originalY, m.originalY, currentLine.yPos)

					text(currentLine.text, currentLine.xPos, currentMessageY - m.originalY)
					pop();
				}
			}
			
		}
	},

	backgroundColor: [255],
	strokeColor: [230]

}

//--------------------HANDLES FOXES & CAVES--------------------//
foxes = 
{
	createCave: function (xPos, yPos, size, direction, numOfFoxes, foxSpeed, foxGap, maxNumOfLives, maxNumberOfFoxesOut, dropPowerupType)
	{
		c = 
		{
			xPos: xPos, 
			yPos: yPos, 
			size: size,
			originalSize: size,
			dropPowerupType: dropPowerupType,
			animation: {isAnimating: false, duration: foxes.caveAnimationData.animationDuration}, 
			direction: direction,
			maxNumberOfFoxesOut: maxNumberOfFoxesOut,
			numOfFoxes: numOfFoxes, 
			foxSpeed: foxSpeed, 
			foxGap: foxGap,
			droppedPowerup: false,
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
				startingLives: null,
				direction: direction,
				movingData:
				{
					platformData: {onPlatform: false, platformIdx: null},
					cloudData: {onCloud: false, cloudIdx: null},
					groundData: {onGround: false, groundIdx: null}
				}
			}

			newFox.startingLives = newFox.lives

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
			
			newCave = this.createCave(currentCave.xPos, currentCave.yPos, currentCave.size, currentCave.direction, currentCave.numOfFoxes, currentCave.foxSpeed, currentCave.foxGap, currentCave.maxNumOfLives, currentCave.maxNumberOfFoxesOut, currentCave.dropPowerupType)
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

			displayNumber = true // controls whether to display number or not (stops at 0)

			if(currentCave.caveFoxesArray.length == 0)
			{
				displayNumber = false
			}

			if(currentCave.caveFoxesArray.length == 0 && currentCave.droppedPowerup == false)
			{
				if(currentCave.dropPowerupType == "size")
				{
					powerups.addPowerups([{xPos: currentCave.xPos, yPos: currentCave.yPos - (110 * s), size: 0.2, type: "size", fromCave: true}])
				}
				else if(currentCave.dropPowerupType == "speed")
				{
					powerups.addPowerups([{xPos: currentCave.xPos, yPos: currentCave.yPos - (110 * s), size: 0.2, type: "speed", fromCave: true}])
				}
				else if(currentCave.dropPowerupType == "flower")
				{
					powerups.addPowerups([{xPos: currentCave.xPos, yPos: currentCave.yPos - (110 * s), size: 0.2, type: "flower", fromCave: true}])
				}
				currentCave.droppedPowerup = true
			}


			//draw cave code
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

				//draw number of foxes left in cave
				if(displayNumber)
				{
					fill(255)
					textFont(NESfont)
					textSize(60 * s)
					textAlign(CENTER)
					text(currentCave.caveFoxesArray.length, x + (10 * s), y + (200 * s))
				}

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

				//draw number of foxes left in cave
				if(displayNumber)
				{
					fill(255)
					textFont(NESfont)
					textSize(60 * s)
					textAlign(CENTER)
					text(currentCave.caveFoxesArray.length, x - (10 * s), y + (200 * s))
				}

				pop();
			}
		}

	},

	getNumberOfFoxesOutside: function(i)
	{
		foxesOutside = 0

		for(j = this.caves[i].caveFoxesArray.length - 1; j >= 0; j--)
		{
			f = this.caves[i].caveFoxesArray[j]
			if(f.isOutside){foxesOutside += 1}
		}

		return foxesOutside
	},

	updateFoxes: function ()
	{

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

					numberOfFoxesOut = this.getNumberOfFoxesOutside(caveIdx)

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
					pointsToAdd = 0
					if(powerups.superSizeData.superSized)
					{
						pointsToAdd = ((currentFox.lives * statsBoard.pointQuantities.foxHit))
						currentFox.lives = 0
					}
					else
					{
						pointsToAdd += statsBoard.pointQuantities.foxHit
						currentFox.lives -= 1;
					}

					if(currentFox.lives <= 0)
					{
						pointsToAdd += statsBoard.pointQuantities.foxKilled
						currentFox.movingData.platformData.onPlatform = false
						currentFox.movingData.cloudData.onCloud = false
						currentFox.movingData.groundData.onGround = false
						currentFox.isDead = true;
						currentFox.direction = "front";
					}

					//add total points to board and animations
					statsBoard.addPoints(pointsToAdd)
					statsBoard.score += pointsToAdd

					//make rabbit char jump
					rabbitCharacter.earRotationData.currentlyRotating = true;
					rabbitCharacter.jumpingData.goingUpwards = true;
					rabbitCharacter.earRotationData.customRotationValue = rabbitCharacter.jumpingData.defaultJumpDuration * 0.5
					rabbitCharacter.jumpingData.jumpingDuration = round(rabbitCharacter.jumpingData.defaultJumpDuration * 0.5)
					rabbitCharacter.userInput.airCondition = "jumping"
				}

				//helper function that checks for whether player is killed by fox
				this.checkPlayerKilledByFox(currentFox)

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
					if(currentFox.yPos > resizeCanvasData.currentHeight)
					{
						currentFox.isOutside = false;
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

	checkPlayerKilledByFox: function(currentFox)
	{

		s = this.foxSize

		jumpedOnY = currentFox.yPos - (75 * s)

		if(currentFox.direction == "left")
		{
			jumpedOnXRight= currentFox.xPos + (65 * s)
			jumpedOnXLeft = currentFox.xPos - (105 * s)
		}
		else if(currentFox.direction == "right")
		{
			jumpedOnXRight= currentFox.xPos + (85 * s)
			jumpedOnXLeft = currentFox.xPos - (78 * s)
		}
		else if(currentFox.direction == "front")
		{
			jumpedOnXRight= currentFox.xPos + (40 * s)
			jumpedOnXLeft = currentFox.xPos - (40 * s)
		}

		jumpedOnXMiddle = (jumpedOnXRight + jumpedOnXLeft) * 0.5

		if(powerups.superSizeData.superSized)
		{
			distanceThatCountsAsDeath = 25 * 2
		}
		else
		{
			distanceThatCountsAsDeath = 25
		}
		
		rabbitCenterY = rabbitCharacter.getCenterPos() - heightPos

		if(currentFox.isOutside)
		{
			if(dist(jumpedOnXRight, jumpedOnY, rabbitCharacter.realWorldPos, rabbitCenterY) < distanceThatCountsAsDeath || 
				dist(jumpedOnXLeft, jumpedOnY, rabbitCharacter.realWorldPos, rabbitCenterY) < distanceThatCountsAsDeath || 
				dist(jumpedOnXMiddle, jumpedOnY, rabbitCharacter.realWorldPos, rabbitCenterY) < distanceThatCountsAsDeath)
			{
			if(powerups.superSizeData.superSized || powerups.superSizeData.invulnerablePeriod > 0)
			{
				powerups.deactivatePowerups("both")
				powerups.superSizeData.invulnerablePeriod = powerups.superSizeData.defaultInvulnerablePeriod

				//kill fox
				currentFox.movingData.platformData.onPlatform = false
				currentFox.movingData.cloudData.onCloud = false
				currentFox.movingData.groundData.onGround = false
				currentFox.isDead = true;
				currentFox.direction = "front";
			}
			else
			{
				rabbitCharacter.isDead = true;
			}
			}
		}
	},

	checkFoxKilled: function(currentFox)
	{

		s = this.foxSize

		jumpedOnY = currentFox.yPos - (75 * s)

		if(currentFox.direction == "left")
		{
			jumpedOnXRight= currentFox.xPos + (65 * s)
			jumpedOnXLeft = currentFox.xPos - (105 * s)
		}
		else if(currentFox.direction == "right")
		{
			jumpedOnXRight = currentFox.xPos + (85 * s)
			jumpedOnXLeft = currentFox.xPos - (78 * s)
		}
		else if(currentFox.direction == "front")
		{
			jumpedOnXRight= currentFox.xPos + (40 * s)
			jumpedOnXLeft = currentFox.xPos - (40 * s)
		}

		xCharacter = rabbitCharacter.realWorldPos
		yCharacter = rabbitCharacter.getFeetPos() - heightPos
 		
		yHeightThreshold = 8

		xInRange = (xCharacter > jumpedOnXLeft) && (xCharacter < jumpedOnXRight)
		yInRange = abs(yCharacter - jumpedOnY) < yHeightThreshold

		if(xInRange && yInRange && currentFox.isOutside && rabbitCharacter.jumpingData.currentlyJumping == true && rabbitCharacter.jumpingData.goingUpwards == false)
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

	foxSize: 0.63,

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
				x = this.caves[caveIdx].caveFoxesArray[foxIdx].xPos
				y = this.caves[caveIdx].caveFoxesArray[foxIdx].yPos

				drawFoxBool = this.caves[caveIdx].caveFoxesArray[foxIdx].isOutside == true

				if(this.caves[caveIdx].caveFoxesArray[foxIdx].isFalling)
				{
					this.caves[caveIdx].caveFoxesArray[foxIdx].direction = "front"
				}
				
				//control changing opacity based on lives left
				currentFox = this.caves[caveIdx].caveFoxesArray[foxIdx]
				opacity = map(currentFox.lives, -3, currentFox.startingLives, 0, 255)
				foxLightColor = color(this.foxColors.darkFurLight[0], this.foxColors.darkFurLight[1], this.foxColors.darkFurLight[2], opacity)
				foxDarkColor = color(this.foxColors.darkFurDark[0], this.foxColors.darkFurDark[1], this.foxColors.darkFurDark[2], opacity)
				foxHighlightColor = color(this.foxColors.highlights[0], this.foxColors.highlights[1], this.foxColors.highlights[2], opacity)
				foxOutlineColor = color(this.foxColors.outlineColor[0], this.foxColors.outlineColor[1], this.foxColors.outlineColor[2], opacity)

				//draw foxes code
				if(this.caves[caveIdx].caveFoxesArray[foxIdx].direction == "right" && drawFoxBool)
				{
					push();
					translate(0, -225 * s);

					//tail colors
					fill(foxLightColor)
					beginShape()
						vertex(x - (60 * s), y + (152 * s));
						vertex(x - (95 * s), y + (154 * s));
						vertex(x - (120 * s), y + (195 * s));
						vertex(x - (80 * s), y + (165 * s));
						vertex(x - (60 * s), y + (158 * s));
					endShape()

					fill(foxDarkColor)
					beginShape()
						vertex(x - (60 * s), y + (164 * s));
						vertex(x - (75 * s), y + (185 * s));
						vertex(x - (120 * s), y + (195 * s));
						vertex(x - (80 * s), y + (165 * s));
						vertex(x - (60 * s), y + (158 * s));
					endShape()

					fill(foxHighlightColor)
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
					fill(foxDarkColor)
					rect(x - (50 * s), y + (190 * s), 15 * s, this.legData.backLegs.innerLegHeight);
					rect(x + (30 * s), y + (190 * s), 15 * s, this.legData.frontLegs.innerLegHeight);
					
					//inner leg styling
					fill(foxOutlineColor)
					rect(x - (50 * s), y + (180 * s) + this.legData.backLegs.innerLegHeight, 15 * s, 10 * s);
					rect(x + (30 * s), y + (180 * s) + this.legData.frontLegs.innerLegHeight, 15 * s, 10 * s);


					fill(foxDarkColor)
					//outer legs
					rect(x - (60 * s), y + (190 * s), 15 * s, this.legData.backLegs.outerLegHeight);
					rect(x + (20 * s), y + (190 * s), 15 * s, this.legData.frontLegs.outerLegHeight);

					//outer leg styling
					fill(foxOutlineColor)
					rect(x - (60 * s), y + (175 * s) + this.legData.backLegs.outerLegHeight, 15 * s, 15 * s);
					rect(x + (20 * s), y + (175 * s) + this.legData.frontLegs.outerLegHeight, 15 * s, 15 * s);

					//body colors
					fill(foxDarkColor)
					rect(x - (60 * s), y + (150 * s), 105 * s, 45 * s); //bottom
					fill(foxLightColor)
					rect(x - (60 * s), y + (150 * s), 105 * s, 10 * s); //top

					//body white belly
					fill(foxHighlightColor);
					beginShape();
						vertex(x - (45 * s), y + (195 * s)) // bottom left
						vertex(x + (3 * s), y + (195 * s)) // bottom right
						vertex(x, y + (190 * s)) // top right
						vertex(x - (42 * s), y + (190 * s)) // top left
					endShape();

					//left ear
					fill(foxDarkColor)
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
					fill(foxLightColor)
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (155 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);

					fill(foxHighlightColor)
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


					stroke(foxOutlineColor); //black outline color
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
					fill(foxLightColor)
					beginShape()
						vertex(x + (45 * s), y + (152 * s));
						vertex(x + (80 * s), y + (154 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()

					fill(foxDarkColor)
					beginShape()
						vertex(x + (45 * s), y + (164 * s));
						vertex(x + (60 * s), y + (185 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()

					fill(foxHighlightColor)
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
					fill(foxDarkColor)
					rect(x - (50 * s), y + (190 * s), 15 * s, this.legData.backLegs.innerLegHeight);
					rect(x + (30 * s), y + (190 * s), 15 * s, this.legData.frontLegs.innerLegHeight);
					
					//inner leg styling
					fill(foxOutlineColor)
					rect(x - (50 * s), y + (180 * s) + this.legData.backLegs.innerLegHeight, 15 * s, 10 * s);
					rect(x + (30 * s), y + (180 * s) + this.legData.frontLegs.innerLegHeight, 15 * s, 10 * s);

					fill(foxDarkColor)

					//outer legs
					rect(x - (60 * s), y + (190 * s), 15 * s, this.legData.backLegs.outerLegHeight);
					rect(x + (20 * s), y + (190 * s), 15 * s, this.legData.frontLegs.outerLegHeight);

					//outer leg styling
					fill(foxOutlineColor)
					rect(x - (60 * s), y + (175 * s) + this.legData.backLegs.outerLegHeight, 15 * s, 15 * s);
					rect(x + (20 * s), y + (175 * s) + this.legData.frontLegs.outerLegHeight, 15 * s, 15 * s);

					//body colors
					fill(foxDarkColor)
					rect(x - (60 * s), y + (150 * s), 105 * s, 45 * s); //bottom
					fill(foxLightColor)
					rect(x - (60 * s), y + (150 * s), 105 * s, 10 * s); //top

					push();
					translate(translateBellyBy, 0)
					//body white belly
					fill(foxHighlightColor);
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
					fill(foxDarkColor)
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
					fill(foxLightColor)
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (155 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);

					fill(foxHighlightColor)
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

					stroke(foxOutlineColor); //black outline color
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
					fill(foxDarkColor)
					beginShape()
						vertex(x + (45 * s), y + (152 * s));
						vertex(x + (80 * s), y + (154 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()
	
					fill(foxLightColor)
					beginShape()
						vertex(x + (45 * s), y + (164 * s));
						vertex(x + (60 * s), y + (185 * s));
						vertex(x + (105 * s), y + (195 * s));
						vertex(x + (65 * s), y + (165 * s));
						vertex(x + (45 * s), y + (158 * s));
					endShape()
	
					fill(foxHighlightColor)
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
	
					fill(foxLightColor);
	
					//main body
					rect(x - (25 * s), y + (150 * s), 50 * s, 70 * s); //body
	
					fill(foxDarkColor)
					//front legs
					rect(x - (35 * s), y + (186 * s), 20 * s, 20 * s); // front left leg
					rect(x + (15 * s), y + (186 * s), 20 * s, 20 * s); // front right leg
	
					fill(foxHighlightColor)
					rect(x - (10 * s), y + (190 * s), 20 * s, 30 * s); //body
	
					translate(translateHeadBy, 0)
	
					//left ear
					fill(foxDarkColor)
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
					fill(foxLightColor)
					beginShape();
						vertex(x + (10 * s), y + (120 * s)) //top left
						vertex(x + (80 * s), y + (120 * s))	//top right
						vertex(x + (90 * s), y + (145 * s)) //right middle
						vertex(x + (45 * s), y + (155 * s)) //bottom point
						vertex(x, y + (145 * s)) //left middle
					endShape(CLOSE);
	
					fill(foxHighlightColor)
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
	
					stroke(foxOutlineColor); //black outline color
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
	levels[currentLevel].scrollPosLeft = (resizeCanvasData.currentWidth * 0.2)
	levels[currentLevel].scrollPosRight = resizeCanvasData.currentWidth * 0.8
	levels[currentLevel].heightPosTop = (resizeCanvasData.currentHeight * 0.2)
	levels[currentLevel].heightPosBottom = resizeCanvasData.currentHeight * 0.65
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
	for(i = 0; i < levels[currentLevel].powerupPositionsArray.length; i++)
	{
		levels[currentLevel].powerupPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].messagesData.length; i++)
	{
		levels[currentLevel].messagesData[i].circleY += resizeCanvasData.yObjStart
		for(j = 0; j < levels[currentLevel].messagesData[i].messages.length; j++)
		{
			currentMessage = levels[currentLevel].messagesData[i].messages[j]
			currentMessage.yPos += resizeCanvasData.yObjStart
		}
	}

	levels[currentLevel].characterYStart += resizeCanvasData.yObjStart
}

//--------------------LEVELS OBJECT (STORES LEVEL DATA)--------------------//
levels = 
[
	//level 0
	{
		//level data
		levelText: "Tutorial: Rescue your daughter Ophelia",
		//vital char data 
		characterYStartHeightPos: 0,
		characterXStartScrollPos: 0,
		characterYStart: 432,
		characterXStart: 520,
		characterSize: 0.5,
		heightPosTop: null,
		heightPosBottom: null,
		scrollPosLeft: null,
		scrollPosRight: null,
		skyColor: [208,227,204],
		bulletInRangeValue: 25,
		//message data
		messagesData: [{circleX: 660, circleY: 390, circleRadius: 40, scale: 1, messages: [{xPos: 0, yPos: 120, text: "Help Alfred", textColor: [0,0,0]}, 
																					{xPos: 0, yPos: 220, text: "find his family!", textColor: [0,0,0]}, 
																					{xPos: 0, yPos: 400, text: "Collect all items", textColor: [0,0,0]},
																					{xPos: 0, yPos: 500, text: "in the pink bar", textColor: [252, 180, 191]},
																					{xPos: 0, yPos: 600, text: "and don't die", textColor: [0, 0, 0]},
																					{xPos: 0, yPos: 700, text: "to score 100%", textColor: [0, 0, 0]} 
																					]}],
		//fox data
		cavesData: [{xPos: 1800, yPos: 432, size: 0.5, direction: "left", numOfFoxes: 3, foxSpeed: 3, foxGap: 200, maxNumOfLives: 10, maxNumberOfFoxesOut: 2, dropPowerupType: "speed"}],
		//powerup data
		powerupPositionsArray: [{xPos: 320, yPos: 380, size: 0.25, type: "flower", fromCave: false}, {xPos: 290, yPos: 380, size: 0.2, type: "size", fromCave: false}, {xPos: 250, yPos: 380, size: 0.2, type: "speed", fromCave: false}, {xPos: 2900, yPos: 380, size: 0.2, type: "flower", fromCave: false}],
		//carrot data
		carrotColor: [246, 118, 34],
		carrotStemColor: [35, 92, 70],
		carrotPositionsArray: 
			[{xPos: 780, yPos: 384, size: 0.2}],
		//lives data
		livesColor: [255, 0, 0],
		heartPositionsArray: 
			[{xPos: 3280, yPos: 200, size: 0.3}],
		//ground data
		grassLight: [243,180,139],
		grassDark: [223,145,94],
		dirtLight: [208,183,172],
		dirtDark: [165,136,122],
		bedRockLight: [84,60,44],
		bedRockDark: [67,53,32],
		groundPositionsArray:
			[[200, 900], [1100, 2000], [2600, 3800], [3950, 4300]],
		//canyon data
		canyonPositionsArray:
			[],
		canyonColor: [208,227,204],
		//platform data
		platformPositionsArray:
			[{yPos: 250, platformStart: 1950, platformEnd: 2600},
			{yPos: 250, platformStart: 3175, platformEnd: 3400}],
		platformGrassLight: [246,241,182],
		platformGrassDark: [238,231,153],
		platformDirtLight: [227,217,106],
		platformDirtDark: [210,198,71],
		platformBedRockLight: [185,151,20],
		platformBedRockDark: [161,126,7],
		//cloud data
		cloudPositionsArray: 
			[{xPos: 2600, yPos: 200, direction: "right", speed: [2, 3], maxLeft: 0, maxRight: 400}],
		//mountain data
		sideMountainsColor: [188,148,90],
		middleMountainColor: [238,206,160],
		riverColor: [238,206,160],
		snowCapColor: [238,206,160],
		mountainPositionsArray:
			[{xPos: 1300, yPos: 432, scale: 1.9},
			{xPos: 3600, yPos: 432, scale: 1.2}],
		//tree data
		leavesColor: [244, 225, 172],
		trunkColor: [120, 100, 40],
		treePositionsArray:
			[{xPos: 460, yPos: 432, scale: 1.2},
			{xPos: 2100, yPos: 250, scale: 1.45},
			{xPos: 4050, yPos: 432, scale: 1.45}],
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
			[{xPos: 2450, yPos: 210, scale: 1, firingFrequency: 120, firingSpeed: 6, maxBulletDistLeft: 225, maxBulletDistRight: 300, maxBulletDistIsX: false}],
		//child data
		childXPos: 4200,
		childYPos: 565,
		childSize: 0.3,
		childPlatformColor: [255],
		//yIdx updated (should only happen once)
		yIdxUpdated: false
	}
]

//--------------------POWERUPS OBJECT (STORES SUPER SPEED / SUPER SIZE / FLOWERS)--------------------//
powerups = 
{
	updatePowerups: function ()
	{
		if(this.superSizeData.superSized)
		{
			this.enlargeForSuperSize()
			this.superSizeData.duration -= 1

			if(this.superSizeData.duration == 0)
			{
				this.deactivatePowerups("size")
			}
		}
		else
		{
			this.scaleDownRabbitAndDecrementInvulnerability()
		}

		if(this.superSpeedData.isActive)
		{
			this.superSpeedVectorsData.xPos = rabbitCharacter.xPos
			this.superSpeedVectorsData.yPos = rabbitCharacter.getCenterPos()
			this.superSpeedVectorsData.size = rabbitCharacter.size
			this.drawSuperSpeedVectors()

			this.superSpeedData.duration -= 1
			if(this.superSpeedData.duration == 0)
			{
				this.deactivatePowerups("speed")
			}
		}

	},

	deactivatePowerups: function(powerupsToDeactivate)
	{
		if(powerupsToDeactivate == "size")
		{
			this.superSizeData.invulnerablePeriod = 0;
			this.superSizeData.superSized = false
		}
		else if(powerupsToDeactivate == "speed")
		{
			this.superSpeedData.isActive = false
			rabbitCharacter.jumpingData.defaultJumpDuration = rabbitCharacter.jumpingData.resetJumpDuration
			if(rabbitCharacter.jumpingData.currentlyJumping == false)
			{
				rabbitCharacter.jumpingData.jumpingDuration = rabbitCharacter.jumpingData.resetJumpDuration
			}
			rabbitCharacter.rabbitSpeedData.defaultSpeed = rabbitCharacter.rabbitSpeedData.resetSpeed
		}
		else if(powerupsToDeactivate == "both")
		{
			//size (copied from above)
			this.superSizeData.invulnerablePeriod = 0;
			this.superSizeData.superSized = false

			//speed (copied from above)
			this.superSpeedData.isActive = false
			if(rabbitCharacter.jumpingData.currentlyJumping == false)
			{
				rabbitCharacter.jumpingData.jumpingDuration = rabbitCharacter.jumpingData.resetJumpDuration
			}
			rabbitCharacter.jumpingData.defaultJumpDuration = rabbitCharacter.jumpingData.resetJumpDuration
			rabbitCharacter.rabbitSpeedData.defaultSpeed = rabbitCharacter.rabbitSpeedData.resetSpeed
		}
	},

	currentRainbowColors: [0, 0, 0],

	getRainbowOutline: function()
	{
		variableAmount = 25
		currentIteration = []

		for(colorIdx = 0; colorIdx < this.currentRainbowColors.length; colorIdx++)
		{
			currentColor = this.currentRainbowColors[colorIdx]

			if(currentColor < 0)
			{
				this.currentRainbowColors[colorIdx] += variableAmount
			}
			else if(currentColor > 255)
			{
				this.currentRainbowColors[colorIdx] -= variableAmount
			}
			else
			{
				this.currentRainbowColors[colorIdx] += random(-variableAmount, variableAmount)
			}

			currentIteration.push(constrain(round(currentColor), 0, 255))
		}
		return currentIteration
	},

	superSizeData:
	{
		superSize: 1,
		superSizeRate: 1.1,
		superSized: false,
		defaultInvulnerablePeriod: 200,
		invulnerablePeriod: 0,
		powerupStemColor: [109, 78, 158],
		powerupCarrotColor: 240,
		defaultDuration: 2000,
		duration: 0
	},

	enlargeForSuperSize: function()
	{
		if(rabbitCharacter.size < this.superSizeData.superSize)
		{
			rabbitCharacter.size *= this.superSizeData.superSizeRate
		}
	},

	scaleDownRabbitAndDecrementInvulnerability: function()
	{
		
		if(rabbitCharacter.size > levels[currentLevel].characterSize)
		{
			rabbitCharacter.size *= 2 - this.superSizeData.superSizeRate
		}
		else
		{
			rabbitCharacter.size = levels[currentLevel].characterSize
		}

		if(this.superSizeData.invulnerablePeriod > 0)
		{
			this.superSizeData.invulnerablePeriod -= 1
		}
	},

	superSpeedData:
	{
		isActive: false,
		defaultDuration: 1000,
		duration: 0
	},

	superSpeedVectorsData:
	{
		rotateSpeedInner: -0.08,
		rotateSpeedOuter: 0.1,
		rotationInner: 3,
		rotationOuter: 0,
		size: 2,
		xPos: 300,
		yPos: 200,
		yellowColor: [255, 238, 117],
	},

	drawSuperSpeedVectors: function ()
	{
		angleMode(RADIANS)

		vectorData = this.superSpeedVectorsData
		x = vectorData.xPos
		y = vectorData.yPos
		s = vectorData.size

		let centerVector = createVector(x, y);
		let innerVector = createVector(70 * s, 70 * s)
		let outerVector = createVector(80 * s, 80 * s)
		
		fill(color(this.superSpeedVectorsData.yellowColor))
		noStroke();
		
		push()
		translate(centerVector.x, centerVector.y)
		innerVector.rotate(vectorData.rotationInner)
		outerVector.rotate(vectorData.rotationOuter)

		innerOuterSize = 20

		ellipse(innerVector.x, innerVector.y, 20 * s, 20 * s)
		ellipse(outerVector.x, outerVector.y, 20 * s, 20 * s)
		pop();

		//two if statements below reset rotate value once one rotation has been reached, otherwise updates them
		if(vectorData.rotationInner <  -(2 * PI))
		{
			vectorData.rotationInner = 0
		}
		else
		{
			vectorData.rotationInner += vectorData.rotateSpeedInner
		}

		if(vectorData.rotationOuter > 2 * PI)
		{
			vectorData.rotationOuter = 0
		}
		else
		{
			vectorData.rotationOuter += vectorData.rotateSpeedOuter
		}

	},

	drawSuperSpeedPowerup: function (x, y, s)
	{	
		push();
		translate(-45 * s, -12 * s)
		noStroke();

		fill(0)
		beginShape();
			//black outline
			vertex(x, y)
			vertex(x, y - (20 * s))
			vertex(x + (10 * s), y - (20 * s))
			vertex(x + (10 * s), y - (40 * s))
			vertex(x + (20 * s), y - (40 * s))
			vertex(x + (20 * s), y - (65 * s))
			vertex(x + (100 * s), y - (65 * s))
			vertex(x + (100 * s), y - (31 * s))
			vertex(x + (90 * s), y - (31 * s))
			vertex(x + (90 * s), y - (16 * s))
			vertex(x + (105 * s), y - (16 * s))
			vertex(x + (105 * s), y + (24 * s))
			vertex(x + (90 * s), y + (24 * s))
			vertex(x + (90 * s), y + (44 * s))
			vertex(x + (70 * s), y + (44 * s))
			vertex(x + (70 * s), y + (64 * s))
			vertex(x + (55 * s), y + (64 * s))
			vertex(x + (55 * s), y + (84 * s))
			vertex(x + (40 * s), y + (84 * s))
			vertex(x + (40 * s), y + (100 * s))
			vertex(x + (25 * s), y + (100 * s))
			vertex(x + (25 * s), y + (115 * s))
			vertex(x - (10 * s), y + (115 * s))
			vertex(x - (10 * s), y + (80 * s))
			vertex(x, y + (80 * s))
			vertex(x, y + (60 * s))
			vertex(x + (10 * s), y + (60 * s))
			vertex(x + (10 * s), y + (40 * s))
			vertex(x - (14 * s), y + (40 * s))
			vertex(x - (14 * s), y)
		endShape()

		//bolt
		fill(this.superSpeedVectorsData.yellowColor)
		rect(x + (30 * s), y - (55 * s), 60 * s, 24 * s)
		rect(x + (20 * s), y - (40 * s), 55 * s, 24 * s)
		rect(x + (10 * s), y - (20 * s), 50 * s, 24 * s)
		rect(x, y, 90 * s, 24 * s)
		rect(x + (30 * s), y + (20 * s), 40 * s, 24 * s)
		rect(x + (20 * s), y + (40 * s), 35 * s, 24 * s)
		rect(x + (10 * s), y + (60 * s), 30 * s, 24 * s)
		rect(x, y + (80 * s), 25 * s, 20 * s)
		pop();
	},

	drawSuperSizePowerup: function (x, y, s)
	{
		noStroke();
		fill(color(this.superSizeData.powerupStemColor));

		//main carrot
		push();
		translate(-(60 * s), 0)
		rect(x + (20 * s), y - (40 * s), 80 * s, 80 * s)
		rect(x, y, 60 * s, 60 * s)
		rect(x - (20 * s), y + (40 * s), 40 * s, 40 * s)
		
		//carrot stems
		push();
		translate(x + (80 * s), y - (30 * s), 20 * s, 20 * s);
		fill(this.superSizeData.powerupCarrotColor);
		angleMode(DEGREES);
		rect(0, 0, 60 * s, 25 * s);
		rotate(-45);
		rect(0, -4 * s, 60 * s, 25 * s);
		rotate(-45);
		rect(-10 * s, -12.5 * s, 60 * s, 25 * s);
		pop();
		pop();
	},

	flowerData:
	{
		stemColorDark: [37, 57, 2],
		stemColorMedium: [65, 101, 5],
		stemColorLight: [86, 132, 7],
		petalColorLight: [255, 102, 102],
		petalColorMedium: [238, 34, 34],
		petalColorDark: [99, 14, 14]
	},

	drawFlowerPowerup: function(x, y, s)
	{
		noStroke();

		push();
		translate(-15 * s, 20 * s)
		//stem
		fill(this.flowerData.stemColorMedium)
		rect(x + (10 * s), y - (40 * s), 10 * s, 85 * s)
		fill(this.flowerData.stemColorDark)
		rect(x + (10 * s), y - (50 * s), 10 * s, 10 * s)
		fill(this.flowerData.stemColorLight)
		rect(x + (20 * s), y - (50 * s), 10 * s, 10 * s)

		//petals
		fill(this.flowerData.petalColorLight)
		rect(x + (30 * s), y - (50 * s), 10 * s, 10 * s)
		rect(x, y - (60 * s), 50 * s, 10 * s)
		rect(x, y - (90 * s), 20 * s, 10 * s)
		fill(this.flowerData.petalColorMedium)
		rect(x - (10 * s), y - (70 * s), 60 * s, 10 * s)
		rect(x - (10 * s), y - (80 * s), 50 * s, 10 * s)
		fill(this.flowerData.petalColorDark)
		rect(x + (10 * s), y - (70 * s), 20 * s, 10 * s)
		rect(x + (20 * s), y - (80 * s), 10 * s, 10 * s)

		//leaves
		fill(this.flowerData.stemColorDark)
		rect(x, y, 30 * s, 10 * s)
		fill(this.flowerData.stemColorMedium)
		rect(x - (10 * s), y - (10 * s), 50 * s, 10 * s)
		rect(x + (30 * s), y - (20 * s), 20 * s, 10 * s)
		fill(this.flowerData.stemColorLight)
		rect(x - (20 * s), y - (20 * s), 20 * s, 10 * s)
		pop();
	},

	powerupsArray: [],

	createPowerup: function (x, y, s, type, fromCave)
	{
		p = 
		{
			x: x,
			y: y,
			type: type,
			currentYPos: y,
			size: s,
			originalSize: s,
			fromCave: fromCave,
			downAnimation: true,
			beenCollected: false,
			powerupFloorPosY: y + (s * 122),
			inProximity: function (charX, charY)
			{
				powerupX = this.x
				powerupY = this.currentYPos + (10 * this.size)

				if(powerups.superSizeData.superSized)
				{
					powerupRadius = (this.size * 90) * 2
				}
				else
				{
					powerupRadius = this.size * 90
				}

				return dist(powerupX, powerupY, charX, charY) < powerupRadius

			}
		}
		return p
	},

	addPowerups: function (powerupsInput)
	{
		for(i = 0; i < powerupsInput.length; i++)
		{
			this.powerupsArray.push(this.createPowerup(powerupsInput[i].xPos, powerupsInput[i].yPos + 20, powerupsInput[i].size, powerupsInput[i].type, powerupsInput[i].fromCave))
		}
	},

	drawPowerups: function()
	{
		for(i = this.powerupsArray.length - 1; i >= 0; i--)
		{
			//check if player is close to this powerup

			if(this.powerupsArray[i].inProximity(rabbitCharacter.realWorldPos, rabbitCharacter.getCenterPos() - heightPos))
			{
				if(!this.powerupsArray[i].beenCollected)
				{
					if(this.powerupsArray[i].type == "speed")
					{
						changeFloorPosYBy = 1.012
						collectedAnimations.addAnimation(this.powerupsArray[i].x, this.powerupsArray[i].powerupFloorPosY * changeFloorPosYBy, color(248, 228, 157), color(245, 219, 106), this.powerupsArray[i])
						statsBoard.addPoints(statsBoard.pointQuantities.speed)
					}
					else if(this.powerupsArray[i].type == "size")
					{
						changeFloorPosYBy = 1.014
						collectedAnimations.addAnimation(this.powerupsArray[i].x, this.powerupsArray[i].powerupFloorPosY * changeFloorPosYBy, color(205, 219, 140), color(176, 201, 71), this.powerupsArray[i])
						statsBoard.addPoints(statsBoard.pointQuantities.size)
					}
					else if(this.powerupsArray[i].type == "flower")
					{
						changeFloorPosYBy = 1.0025
						collectedAnimations.addAnimation(this.powerupsArray[i].x, this.powerupsArray[i].powerupFloorPosY * changeFloorPosYBy, color(250), color(230), this.powerupsArray[i])
						statsBoard.addPoints(statsBoard.pointQuantities.flower)
					}
				}
				
				this.powerupsArray[i].beenCollected = true;
			}

			// animate powerups if they haven't been collected
			if(this.powerupsArray[i].downAnimation && !this.powerupsArray[i].beenCollected)
			{
				
				if(this.powerupsArray[i].currentYPos - this.powerupsArray[i].y == 5)
				{
					this.powerupsArray[i].downAnimation = false;
				}
				if(frameCount % 3 == 0)
				{
					this.powerupsArray[i].currentYPos++;
				}
			}
			else if (!this.powerupsArray[i].downAnimation && !this.powerupsArray[i].beenCollected)
			{
				if(this.powerupsArray[i].y - this.powerupsArray[i].currentYPos == 5)
				{
					this.powerupsArray[i].downAnimation = true;
				}
				if(frameCount % 3 == 0)
				{
					this.powerupsArray[i].currentYPos--;
				}
			} 

			//animate the powerups once they are collected
			if(this.powerupsArray[i].beenCollected)
			{
				if(this.powerupsArray[i].originalSize * 2 > this.powerupsArray[i].size)
				{
					this.powerupsArray[i].size *= 1.012;
				}
				else
				{
					p = this.powerupsArray[i]
					duration = 10 // controls duration in # of frames of powerups going to game char

					xUpdate = abs(p.x - (rabbitCharacter.realWorldPos)) / duration
					yUpdate = abs((p.y + heightPos) - rabbitCharacter.getCenterPos()) / duration
					sizeUpdate = (0.05 - h.size) / duration

					this.powerupsToCharArray.push({xPos: p.x, 
													yPos: p.y, 
													size: p.size, 
													lifeSpan: duration,
													xUpdate: xUpdate, 
													yUpdate: yUpdate, 
													sizeUpdate: sizeUpdate,
													type: p.type,
													fromCave: this.powerupsArray[i].fromCave})

					this.powerupsArray.splice(i, 1);

					continue;
				}
			}

			//draw the powerups to the canvas
			x = this.powerupsArray[i].x
			y = this.powerupsArray[i].currentYPos
			s = this.powerupsArray[i].size

			if(this.powerupsArray[i].type == "speed")
			{
				this.drawSuperSpeedPowerup(x, y, s)
			}
			else if(this.powerupsArray[i].type == "size")
			{
				this.drawSuperSizePowerup(x, y, s)
			}
			else if(this.powerupsArray[i].type == "flower")
			{
				this.drawFlowerPowerup(x, y, s)
			}
		}
	},

	powerupsToCharArray: [],

	drawPowerupsToChar: function()
	{
		for(i = 0; i < this.powerupsToCharArray.length; i++)
		{
			currentPower = this.powerupsToCharArray[i]

			if(currentPower.xPos > rabbitCharacter.realWorldPos)
			{
				currentPower.xPos -= currentPower.xUpdate
			}
			else
			{
				currentPower.xPos += currentPower.xUpdate
			}

			if(currentPower.yPos > rabbitCharacter.getCenterPos())
			{
				currentPower.yPos -= currentPower.yUpdate
			}
			else
			{
				currentPower.yPos += currentPower.yUpdate
			}
			
			currentPower.size += currentPower.sizeUpdate

			if(currentPower.type == "size")
			{
				this.drawSuperSizePowerup(currentPower.xPos, currentPower.yPos, currentPower.size)
			}
			else if(currentPower.type == "speed")
			{
				this.drawSuperSpeedPowerup(currentPower.xPos, currentPower.yPos, currentPower.size)
			}
			else if(currentPower.type == "flower")
			{
				this.drawFlowerPowerup(currentPower.xPos, currentPower.yPos, currentPower.size)
			}

			currentPower.lifeSpan -= 1
			if(currentPower.lifeSpan <= 0)
			{

				//update caves
				if(currentPower.fromCave)
				{
					statsBoard.itemCollected("cave")
				}

				//activate powerups
				if(currentPower.type == "size" && rabbitCharacter.isDead == false)
				{
					powerups.superSizeData.superSized = true
					powerups.superSizeData.duration += powerups.superSizeData.defaultDuration

				}
				else if(currentPower.type == "speed" && rabbitCharacter.isDead == false)
				{

					powerups.superSpeedData.isActive = true
					powerups.superSpeedData.duration += powerups.superSpeedData.defaultDuration
					rabbitCharacter.jumpingData.defaultJumpDuration = 65
					if(rabbitCharacter.jumpingData.currentlyJumping == false)
					{
						rabbitCharacter.jumpingData.jumpingDuration = 65
					}
					rabbitCharacter.rabbitSpeedData.defaultSpeed = 6
				}

				//add points
				if(currentPower.type == "size")
				{
					statsBoard.score += statsBoard.pointQuantities.size
				}
				else if(currentPower.type == "speed")
				{
					statsBoard.score += statsBoard.pointQuantities.speed
				}
				else if(currentPower.type == "flower")
				{
					statsBoard.score += statsBoard.pointQuantities.flower
				}

				//remove points
				this.powerupsToCharArray.splice(i, 1)
			}
		}
	}

}

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

		if(powerups.superSizeData.superSized)
		{
			childIsFoundRadius = 25 * 2
		}
		else
		{
			childIsFoundRadius = 25
		}

		childIsFound =  dist(this.xPos, this.yPos, charX, charY) < childIsFoundRadius

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

				if(powerups.superSizeData.superSized)
				{
					heartRadius = (this.size * 90) * 2
				}
				else
				{
					heartRadius = this.size * 90
				}

				return dist(heartX, heartY, charX, charY) < heartRadius

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
					collectedAnimations.addAnimation(this.heartsArray[i].x, this.heartsArray[i].heartFloorPosY, color(247, 214, 214), color(247, 174, 175), this.heartsArray[i])

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
	boardScale:
	{
		x: null,
		y: null,
		scale: null
	},

	score: 0,

	totalScore: null,

	deathHandled: false,

	updateTotals: function ()
	{
		carrotTotal = 0;
		enemyTotal = 0;
		livesTotal = 0;
		childrenTotal = levels.length; //one less than all levels (last level finds wife)

		//calculate totals from all level data
		for(i = 0; i < levels.length; i++)
		{
			carrotTotal += levels[i].carrotPositionsArray.length
			livesTotal += levels[i].heartPositionsArray.length
			enemyTotal += levels[i].enemyPositionsArray.length
		}

		//calculate cave data totals
		for(caveIdx = 0; caveIdx < foxes.caves.length; caveIdx++)
		{
		}

		this.lives.total = livesTotal
		this.enemies.total = enemyTotal
		this.carrots.total = carrotTotal
		this.children.total = childrenTotal

		this.totalScore = (livesTotal * this.pointQuantities.life) + 
						(carrotTotal * this.pointQuantities.carrot) + 
						(enemyTotal * this.pointQuantities.enemy) + 
						(childrenTotal * this.pointQuantities.child)

		//update quantities for new level
		this.lives.current = 1;
		this.score = 0;

	},

	itemCollected: function (item)
	{
		if(item == "cave")
		{
			this.caves.thisLevel += 1
			this.caves.totalCollected += 1
		}
		else if(item == "life")
		{
			this.lives.current += 1
			this.lives.thisLevel += 1
		}
	},

	updateCurrentLevel: function ()
	{
		this.carrots.thisLevelTotal = levels[currentLevel].carrotPositionsArray.length
		this.caves.thisLevelTotal = levels[currentLevel].cavesData.length
		this.enemies.thisLevelTotal = levels[currentLevel].enemyPositionsArray.length
		this.lives.thisLevelTotal = levels[currentLevel].heartPositionsArray.length
		this.carrots.thisLevel = 0;
		this.carrots.totalCollected = 0;
		this.caves.thisLevel = 0;
		this.caves.totalCollected = 0;
		this.enemies.thisLevel = 0;
		this.enemies.totalKilled = 0;
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
				gameOver.drawMessageBool = true;
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
		carrot: 15,
		life: 75,
		child: 100,
		enemy: 50,
		death: 100,
		foxHit: 10,
		foxKilled: 50,
		speed:  50,
		size: 50,
		flower: 250
	},

	lives:
	{
		current: 1,
		thisLevel: 0,
		thisLevelTotal: null,
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

	caves:
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
		yPos: 100,
		size: 0.2
	},

	heartData:
	{
		xPos: 350,
		yPos: 50,
		size: 0.3
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

			if(currentCarrot.xPos - scrollPos > this.carrotData.xPos)
			{
				currentCarrot.xPos -= currentCarrot.xUpdate
			}
			else
			{
				currentCarrot.xPos += currentCarrot.xUpdate
			}

			if(currentCarrot.yPos > this.carrotData.yPos)
			{
				currentCarrot.yPos -= currentCarrot.yUpdate
			}
			else
			{
				currentCarrot.yPos += currentCarrot.yUpdate
			}

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


			if(currentHeart.xPos > this.heartData.xPos)
			{
				currentHeart.xPos -= currentHeart.xUpdate
			}
			else
			{
				currentHeart.xPos += currentHeart.xUpdate
			}

			if(currentHeart.yPos > this.heartData.yPos)
			{
				currentHeart.yPos -= currentHeart.yUpdate
			}
			else
			{
				currentHeart.yPos += currentHeart.yUpdate
			}


			currentHeart.size += currentHeart.sizeUpdate
			this.drawHeart(currentHeart.xPos, currentHeart.yPos, currentHeart.size)
			currentHeart.lifeSpan -= 1
			if(currentHeart.lifeSpan <= 0)
			{
				statsBoard.score += this.pointQuantities.life;
				statsBoard.itemCollected("life")
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

			if(currentChild.xPos > this.childrenData.xPos)
			{
				currentChild.xPos -= currentChild.xUpdate
			}
			else
			{
				currentChild.xPos += currentChild.xUpdate
			}

			if(currentChild.yPos > this.childrenData.yPos)
			{
				currentChild.yPos -= currentChild.yUpdate
			}
			else
			{
				currentChild.yPos += currentChild.yUpdate
			}

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

	drawBoard: function (levelText)
	{
		textSize(30)
		textAlign(LEFT)
		textFont(NESfont)
		noStroke()

		fill(255)
		stroke(230);
		strokeWeight(5);
		rect(20, 20, 365, 120, 15) //main board
		rect(400, 20, 648, 50, 13) // side board

		noStroke();
		fill(0)
		textAlign(LEFT)
		text(levelText, 418, 55)

		//score
		textAlign(RIGHT)
		text(this.score, 205, 60)

		//lives
		this.drawHeart(this.heartData.xPos, this.heartData.yPos, this.heartData.size)
		text(this.lives.current, 320, 60)

		//current level data
		currentLevelBackgroundColor = color(252, 180, 191)
		fill(currentLevelBackgroundColor);
		rect(35, 76, 336, 50, 10) //pink bar

		//pink bar data
		textAlign(CENTER)
		currentLevelNumberColor = color(255, 255, 255)

		fill(currentLevelNumberColor)

		//carrots data
		text(this.carrots.thisLevelTotal - this.carrots.thisLevel, 107, 110)

		//enemies data
		text(this.enemies.thisLevelTotal - this.enemies.thisLevel, 176, 110)
		
		//cave data
		text(this.caves.thisLevelTotal - this.caves.thisLevel, 270, 110)

		//lives data
		text(this.lives.thisLevelTotal - this.lives.thisLevel, 346, 110)

		// // DRAW CHILD SYMBOL
		// this.drawRabbit(this.childrenData.xPos, this.childrenData.yPos, this.childrenData.size, this.childrenData.outlineColor, this.childrenData.lightColor, this.childrenData.darkColor)
		// // DRAW MOTHER SYMBOL
		// this.drawRabbit(this.wifeData.xPos, this.wifeData.yPos, this.wifeData.size, this.wifeData.outlineColor, this.wifeData.lightColor, this.wifeData.darkColor)

		//draw carrot
		this.drawCarrot(this.carrotData.xPos, this.carrotData.yPos, this.carrotData.size)

		//draw heart
		this.drawHeart(306, 100, 0.3)

		//draw enemy
		enemyX = 140
		enemyY = 105
		enemySize = 0.32

		fill(enemies.enemyColors.innerFoot)
		rect(enemyX - (20 * enemySize), enemyY + (15 * enemySize), 12 * enemySize, 25 * enemySize) // inner foot
		fill(enemies.enemyColors.body)
		rect(enemyX - (20 * enemySize), enemyY - (30 * enemySize), 40 * enemySize, 60 * enemySize) // main body
		fill(enemies.enemyColors.outerFoot)
		rect(enemyX + (10 * enemySize), enemyY + (15 * enemySize), 15 * enemySize, 25 * enemySize) // outer foot

		fill(enemies.enemyColors.face)
		rect(enemyX - (14 * enemySize), enemyY - (50 * enemySize), 28 * enemySize, 20 * enemySize) // head
		fill(enemies.enemyColors.hatBottom)
		rect(enemyX - (32 * enemySize), enemyY - (59 * enemySize), 60 * enemySize, 9 * enemySize) // hat brim
		fill(enemies.enemyColors.hatTop)
		rect(enemyX - (14 * enemySize), enemyY - (70 * enemySize), 28 * enemySize, 11 * enemySize) // hat top

		fill(enemies.enemyColors.gunBottom)
		rect(enemyX - (14 * enemySize), enemyY - (7 * enemySize), 16 * enemySize, 10 * enemySize) // gun handle
		fill(enemies.enemyColors.gunTop)
		rect(enemyX - (30 * enemySize), enemyY - (15 * enemySize), 65 * enemySize, 9 * enemySize) // gun barrel

		//draw cave
		caveX = 222
		caveY = 118
		caveSize = 0.115
		push();
		translate(-75 * caveSize, -310 * caveSize)
		noStroke();

		//inside cave
		fill(color(foxes.caveColors.inside))
		beginShape();
			vertex(caveX - (110 * caveSize), caveY + (310 * caveSize))
			vertex(caveX - (105 * caveSize), caveY + (120 * caveSize))
			vertex(caveX - (40 * caveSize), caveY + (40 * caveSize))
			vertex(caveX + (170 * caveSize), caveY + (40 * caveSize))
			vertex(caveX + (170 * caveSize), caveY + (310 * caveSize))
		endShape();

		//sorted from left -> right
			//sorted by y
		fill(color(foxes.caveColors.darkStone))
		rect(caveX - (120 * caveSize), caveY + (260 * caveSize), 30 * caveSize, 30 * caveSize)
		rect(caveX - (120 * caveSize), caveY + (205 * caveSize), 30 * caveSize, 30 * caveSize)
		rect(caveX - (120 * caveSize), caveY + (140 * caveSize), 40 * caveSize, 40 * caveSize)
		rect(caveX - (90 * caveSize), caveY + (70 * caveSize), 40 * caveSize, 40 * caveSize)
		rect(caveX - (80 * caveSize), caveY + (50 * caveSize), 40 * caveSize, 40 * caveSize)
		rect(caveX - (30 * caveSize), caveY + (10 * caveSize), 40 * caveSize, 40 * caveSize)
		rect(caveX + (40 * caveSize), caveY + (10 * caveSize), 50 * caveSize, 50 * caveSize)
		rect(caveX + (110 * caveSize), caveY + (25 * caveSize), 70 * caveSize, 50 * caveSize)
		rect(caveX + (110 * caveSize), caveY + (60 * caveSize), 60 * caveSize, 60 * caveSize)
		rect(caveX + (160 * caveSize), caveY + (70 * caveSize), 60 * caveSize, 60 * caveSize)
		rect(caveX + (140 * caveSize), caveY + (120 * caveSize), 95 * caveSize, 95 * caveSize)
		rect(caveX + (160 * caveSize), caveY + (170 * caveSize), 85 * caveSize, 85 * caveSize)
		rect(caveX + (200 * caveSize), caveY + (230 * caveSize), 80 * caveSize, 80 * caveSize)

		fill(color(foxes.caveColors.lightStone))
		rect(caveX - (120 * caveSize), caveY + (280 * caveSize), 30 * caveSize, 30 * caveSize)
		rect(caveX - (140 * caveSize), caveY + (270 * caveSize), 30 * caveSize, 30 * caveSize)
		rect(caveX - (130 * caveSize), caveY + (230 * caveSize), 35 * caveSize, 35 * caveSize)
		rect(caveX - (130 * caveSize), caveY + (180 * caveSize), 30 * caveSize, 30 * caveSize)
		rect(caveX - (110 * caveSize), caveY + (100 * caveSize), 40 * caveSize, 40 * caveSize)
		rect(caveX - (60 * caveSize), caveY + (25 * caveSize), 40 * caveSize, 40 * caveSize)
		rect(caveX, caveY, 50 * caveSize, 50 * caveSize)
		rect(caveX + (80 * caveSize), caveY + (30 * caveSize), 55 * caveSize, 55 * caveSize)
		rect(caveX + (90 * caveSize), caveY + (15 * caveSize), 70 * caveSize, 50 * caveSize)
		rect(caveX + (140 * caveSize), caveY + (80 * caveSize), 45 * caveSize, 45 * caveSize)
		rect(caveX + (200 * caveSize), caveY + (125 * caveSize), 25 * caveSize, 25 * caveSize)
		rect(caveX + (130 * caveSize), caveY + (140 * caveSize), 65 * caveSize, 65 * caveSize)
		rect(caveX + (140 * caveSize), caveY + (220 * caveSize), 90 * caveSize, 90 * caveSize)
		rect(caveX + (210 * caveSize), caveY + (180 * caveSize), 55 * caveSize, 55 * caveSize)
		rect(caveX + (250 * caveSize), caveY + (270 * caveSize), 40 * caveSize, 40 * caveSize)

		pop();

	},

	drawCarrot: function (x, y, s)
	{
		noStroke();
		fill(carrots.innerColor)
		//main carrot
		push();
		translate(-(60 * s))
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
				powerups.deactivatePowerups("both")
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

				if(powerups.superSizeData.superSized)
				{
					carrotRadius = (this.size * 90) * 2
				}
				else
				{
					carrotRadius = this.size * 90
				}
				
				return dist(carrotX, carrotY, charX, charY) < carrotRadius

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
					collectedAnimations.addAnimation(this.carrotArray[i].x, this.carrotArray[i].carrotFloorPosY, color(248, 187, 0), color(248, 150, 0), this.carrotArray[i])
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
					statsBoard.carrotsToStatsArray.push({xPos: c.x + scrollPos, 
														yPos: c.y + heightPos, 
														size: c.size, 
														lifeSpan: duration,
														xUpdate: abs(c.x - (statsBoard.carrotData.xPos - scrollPos)) / duration, 
														yUpdate: abs((c.y + heightPos) - statsBoard.carrotData.yPos) / duration, 
														sizeUpdate: (statsBoard.carrotData.size - c.size) / duration
														})
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
		originalGroundStart = groundStart

		while(groundStart < groundEnd)
		{
			xRandom = size/2
			yRandom = size/4
			widthRandom = [size - (size * 0.15), size + (size * 0.15)]
			heightRandom = [size - (size * 0.15), size + (size * 0.15)]
			
			// updates last square in the row so that it doesn't draw over row
			lastColumn = groundStart + density >= groundEnd
			firstColumn = groundStart == originalGroundStart

			currentX = groundStart

			if(lastColumn)
			{
				yPos += size / 2
				if(groundStart + density > groundEnd + size / 2)
				{
					currentX -= size / 2
				}
			}

			if(firstColumn)
			{
				yPos += size / 2
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

			if(firstColumn)
			{
				yPos -= size / 2
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
		this.updateAnimalsOnGround()
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

	updateAnimalsOnGround: function ()
	{
		//loop through all ground objects
		for(groundSectionIdx = 0; groundSectionIdx < levels[currentLevel].groundPositionsArray.length; groundSectionIdx++)
		{
			currentGroundStart = levels[currentLevel].groundPositionsArray[groundSectionIdx][0]
			currentGroundEnd = levels[currentLevel].groundPositionsArray[groundSectionIdx][1]

			//check for rabbit on ground

			distFromGroundNecessary = 20

			//update character on clouds
			gameCharXInRange = (rabbitCharacter.realWorldPos > currentGroundStart &&
								rabbitCharacter.realWorldPos < currentGroundEnd);

			gameCharYInRange = abs((rabbitCharacter.yPos) - (floorPos_y + heightPos)) < distFromGroundNecessary

			onGround = gameCharXInRange && gameCharYInRange
			
			if(onGround && rabbitCharacter.jumpingData.currentlyJumping == false && rabbitCharacter.isDead == false)
			{
				//align rabbit ypos with the ground
				rabbitCharacter.yPos = floorPos_y + heightPos
			}



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

	getFeetPos: function ()
	{
		return this.yPos
	},

	getCenterPos: function ()
	{
		return (this.yPos - (55 * this.size))
	},

	getHeadPos: function ()
	{
		return this.yPos - (150 * this.size)
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
		defaultRotationValue: 80,
		currentRotationValue: 0
	},

	jumpingData:
	{
		currentlyJumping: false,
		goingUpwards: true,
		currentSpeed: 0,
		resetJumpDuration: 40,
		defaultJumpDuration: 40,
		jumpingDuration: 40
	},

	rabbitSpeedData:
	{
		resetSpeed: 4,
		defaultSpeed: 4
	},

	checkOnGround: function ()
	{
		onFloor = abs(this.getFeetPos() - (floorPos_y + heightPos)) < 8
		
		if(onFloor && this.isDead == false)
		{
			rabbitCharacter.onFloor = true;
			rabbitCharacter.yPos = floorPos_y + heightPos
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
			this.yPos = platformHeight
		}

		//keep rabbit yPos aligned with current cloud
		if(this.onFloor && this.ridingCloudData.onCloud)
		{
			cloudHeight = clouds.cloudsArray[this.ridingCloudData.cloudRiding].yPos + heightPos + 60
			this.yPos = cloudHeight
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
				if(this.earRotationData.currentRotationValue > this.earRotationData.customRotationValue)
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
				if(this.earRotationData.currentRotationValue < 0)
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
		else
		{
			this.earRotationData.currentRotationValue = 0
			this.earRotationData.customRotationValue = this.earRotationData.defaultRotationValue
		}


		//control jumping animation
		if(this.jumpingData.currentlyJumping)
		{	
			defaultJumpDuration = this.jumpingData.defaultJumpDuration
			this.jumpingData.jumpingDuration -= 1
			if(this.jumpingData.goingUpwards)
			{
				if(this.getCenterPos() + resizeCanvasData.yCanvasTranslate  < levels[currentLevel].heightPosTop)
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
					this.jumpingData.jumpingDuration = defaultJumpDuration;
				}
				else
				{
					this.jumpingData.currentSpeed = map(this.jumpingData.jumpingDuration * 1.5, 2 * 1.5, defaultJumpDuration * 1.5, 0, 10)
				}
			}
			else if(this.isDead == false && this.jumpingData.goingUpwards == false)
			{
				if(this.getCenterPos() + resizeCanvasData.yCanvasTranslate> levels[currentLevel].heightPosBottom && this.onFloor == false)
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
					this.jumpingData.jumpingDuration = defaultJumpDuration
					this.jumpingData.currentSpeed = 0;
					this.jumpingData.goingUpwards = true;
					this.userInput.airCondition = "walking";
				}
				else
				{
					this.jumpingData.currentSpeed = map((defaultJumpDuration - this.jumpingData.jumpingDuration) * 1.5, 2 * 1.5, defaultJumpDuration * 1.5, 0, 10)
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
	
		strokeColor = null
		if(powerups.superSizeData.superSized)
		{
			
			strokeColor = color(powerups.getRainbowOutline())
		}
		else
		{
			strokeColor = 0
		}

		//show invulnerable period variables
		showRabbitCharacter = frameCount % 5 < 4

		//control graphics of character
		push();
		translate(0, -220 * s)
		if(this.userInput.direction == "right")
		{	
			if(this.xPos < levels[currentLevel].scrollPosRight)
			{
				this.xPos += this.rabbitSpeedData.defaultSpeed;

				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "right")
				{
					this.xPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}
			else
			{
				scrollPos -= this.rabbitSpeedData.defaultSpeed;
				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "right")
				{
					scrollPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}

			//handles invulernable period
			if(powerups.superSizeData.invulnerablePeriod > 0 && showRabbitCharacter)
			{
				pop();
				return
			}

			stroke(strokeColor); //black outline color
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
			
			stroke(strokeColor);
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
		}
		else if(this.userInput.direction == "left")
		{
			if(this.xPos > levels[currentLevel].scrollPosLeft)
			{
				this.xPos -= this.rabbitSpeedData.defaultSpeed;

				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "left")
				{
					this.xPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}
			else
			{
				scrollPos += this.rabbitSpeedData.defaultSpeed;
				if(this.ridingCloudData.onCloud && clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "left")
				{
					scrollPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed
				}
			}

			//handles invulnerable period
			if(powerups.superSizeData.invulnerablePeriod > 0 && showRabbitCharacter)
			{
				pop();
				return
			}

			stroke(strokeColor); //black outline color
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
			stroke(strokeColor);
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
		}
		else if(this.userInput.direction == "front")
		{
			
			//handles invulnerable period
			if(powerups.superSizeData.invulnerablePeriod > 0 && showRabbitCharacter)
			{
				pop();
				return
			}

			stroke(strokeColor); //black outline color
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
		}
		pop();
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
		enemyInRange = dist(this.enemiesArray[enemyIdx].xPos, this.enemiesArray[enemyIdx].yPos - 60, rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos() - heightPos) < levels[currentLevel].bulletInRangeValue

		if(enemyInRange && rabbitCharacter.jumpingData.goingUpwards == false)
		{
			rabbitCharacter.earRotationData.currentlyRotating = true;
			rabbitCharacter.jumpingData.goingUpwards = true;
			rabbitCharacter.earRotationData.customRotationValue = rabbitCharacter.jumpingData.defaultJumpDuration * 0.75
			rabbitCharacter.jumpingData.jumpingDuration = round(rabbitCharacter.jumpingData.defaultJumpDuration * 0.75)
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

			if(powerups.superSizeData.superSized)
			{
				bulletInContactRadius = 20 * 2
			}
			else
			{
				bulletInContactRadius = 20
			}

			if(dist(bulletX, bulletY, rabbitCharacter.realWorldPos, rabbitCharacter.getCenterPos() - heightPos) < bulletInContactRadius)
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
					if(powerups.superSizeData.superSized || powerups.superSizeData.invulnerablePeriod > 0)
					{
						powerups.deactivatePowerups("both")
						powerups.superSizeData.invulnerablePeriod = powerups.superSizeData.defaultInvulnerablePeriod
					}
					else
					{
						rabbitCharacter.isDead = true;
					}
					this.bulletsArray.splice(bulletIdx, 1) 
				}				

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

birds = 
{
	settings:
	{
		startingLeft: null,
		startingRight: null,
		frequency: null,
		clusterSpeed: null,
		flapSpeed: null,
		xRandom: null,
		yRandom: null,
		numOfBirds: null,
		scale: null
	},

	birdColorData:
	{
		birdLight: [57, 26, 28],
		birdDark: [7, 2, 0],
		birdBeak: [250, 164, 28]
	},
	
	drawBird: function (x, y, s, frame, direction)
	{
		noStroke();
	
		if(direction == "right")
		{
			if(frame == 1)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y - (14 * s), (100 * s), (14 * s))
				rect(x + (7 * s), y - (28 * s), (56 * s), (14 * s))
				fill(this.birdColorData.birdBeak)
				rect(x + (86 * s), y, (28 * s), (14 * s))
			}
			else if(frame == 2)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y - (14 * s), (100 * s), (14 * s))

				fill(this.birdColorData.birdBeak)
				rect(x + (86 * s), y, (28 * s), (14 * s))
			}
			else if(frame == 3)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y + (14 * s), (100 * s), (14 * s))

				fill(this.birdColorData.birdBeak)
				rect(x + (86 * s), y, (28 * s), (14 * s))
			}
			else if(frame == 4)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y + (14 * s), (100 * s), (14 * s))
				rect(x + (7 * s), y + (28 * s), (56 * s), (14 * s))

				fill(this.birdColorData.birdBeak)
				rect(x + (86 * s), y, (28 * s), (14 * s))
			}
		}
		else if(direction == "left")
		{
			if(frame == 1)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y - (14 * s), (100 * s), (14 * s))
				rect(x + (23 * s), y - (28 * s), (56 * s), (14 * s))

				fill(this.birdColorData.birdBeak)
				rect(x - (28 * s), y, (28 * s), (14 * s))
			}
			else if(frame == 2)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))
		
				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y - (14 * s), (100 * s), (14 * s))
		
				fill(this.birdColorData.birdBeak)
				rect(x - (28 * s), y, (28 * s), (14 * s))
			}
			else if(frame == 3)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y + (14 * s), (100 * s), (14 * s))

				fill(this.birdColorData.birdBeak)
				rect(x - (28 * s), y, (28 * s), (14 * s))

			}
			else if(frame == 4)
			{
				fill(this.birdColorData.birdLight)
				rect(x - (14 * s), y, (114 * s), (14 * s))

				fill(this.birdColorData.birdDark)
				rect(x - (7 * s), y + (14 * s), (100 * s), (14 * s))
				rect(x + (23 * s), y + (28 * s), (56 * s), (14 * s))

				fill(this.birdColorData.birdBeak)
				rect(x - (28 * s), y, (28 * s), (14 * s))
			}
		}
		
	},

	clusters: [],

	generateBirdCluster: function (numOfBirds, xRandom, yRandom, scale)
	{
		birdsArray = []

		for(i = 0; i < numOfBirds; i++)
		{
			b = 
			{
				xPos: random(-xRandom, xRandom),
				yPos: random(-yRandom, yRandom),
				frame: round(random(1, 4)),
				goingUp: false,
				scale: scale
			}
			birdsArray.push(b)
		}

		return birdsArray
	},


	generateBirdClusters: function (clusterYPositions)
	{
		for(clusterIdx = 0; clusterIdx < clusterYPositions.length; clusterIdx++)
		{
			xRandom = this.settings.xRandom
			yRandom = this.settings.yRandom
			numberOfBirds = this.settings.numOfBirds
			scale = this.settings.scale
			clusterY = clusterYPositions[clusterIdx].yPos
			
			cooldown = round(random(this.settings.frequency / 2, this.settings.frequency * 1.5))

			if(random(0, 1) < 0.5)
			{
				currentCluster = {xPos: this.settings.startingLeft, 
								yPos: clusterY, 
								direction: "right", 
								birds: this.generateBirdCluster(this.settings.numOfBirds, this.settings.xRandom, this.settings.yRandom, this.settings.scale),
								cooldown: cooldown}
			}

			else
			{
				//UPDATE TO WINDOW XPOS!!
				currentCluster = {xPos: this.settings.startingRight, 
								yPos: clusterY, 
								direction: "left", 
								birds: this.generateBirdCluster(this.settings.numOfBirds, this.settings.xRandom, this.settings.yRandom, this.settings.scale),
								cooldown: cooldown}
			}

			this.clusters.push(currentCluster)
		}
	},

	drawBirdClusters: function ()
	{
		for(clusterIdx = 0; clusterIdx < this.clusters.length; clusterIdx++)
		{
			this.drawCluster(this.clusters[clusterIdx])
		}

	},

	drawCluster: function (currentCluster)
	{
		push();
		translate(currentCluster.xPos, currentCluster.yPos);

		for(birdIdx = 0; birdIdx < currentCluster.birds.length; birdIdx ++)
		{
			currentBird = currentCluster.birds[birdIdx]
			this.drawBird(currentBird.xPos, currentBird.yPos, currentBird.scale, currentBird.frame, currentCluster.direction)
		}

		if(currentCluster.direction == "right")
		{
			currentCluster.xPos += this.settings.clusterSpeed
		}
		else if(currentCluster.direction == "left")
		{
			currentCluster.xPos -= this.settings.clusterSpeed
		}
		pop();
	},

	updateBirdFlapping: function ()
	{
		for(clusterIdx = 0; clusterIdx < this.clusters.length; clusterIdx++)
		{
			currentCluster = this.clusters[clusterIdx]

			for(birdIdx = 0; birdIdx < currentCluster.birds.length; birdIdx ++)
			{
				currentBird = currentCluster.birds[birdIdx]
				currentFrame = currentBird.frame
				goingUp = currentBird.goingUp

				//update flapping
				if(frameCount % this.settings.flapSpeed == 0)
				{
					if(currentFrame < 4 && goingUp)
					{
						currentBird.frame += 1
					}
					else if(currentFrame > 1 && !goingUp)
					{
						currentBird.frame -= 1
					}
					else if(currentFrame == 4)
					{
						currentBird.goingUp = false
						currentBird.frame -= 1
					}
					else if(currentFrame == 1)
					{
						currentBird.goingUp = true
						currentBird.frame += 1
					}
				}
			}
		}
	},

	updateClusterRespawn: function ()
	{
		for(clusterIdx = 0; clusterIdx < this.clusters.length; clusterIdx++)
		{
			currentCluster = this.clusters[clusterIdx]
			console.log(currentCluster)
			if(currentCluster.xPos < this.settings.startingLeft && currentCluster.direction == "left")
			{
				currentCluster.cooldown -= 1
			}

			if(currentCluster.xPos > this.settings.startingRight && currentCluster.direction == "right")
			{
				currentCluster.cooldown -= 1
			}

			if(currentCluster.cooldown < 0)
			{
				newCooldown = round(random(this.settings.frequency / 2, this.settings.frequency * 1.5))

				if(random(0, 1) < 0.5)
				{
					currentCluster.cooldown = newCooldown
					currentCluster.xPos = this.settings.startingLeft
					currentCluster.direction = "right"
				}
				else
				{
					currentCluster.cooldown = newCooldown
					currentCluster.xPos = this.settings.startingRight
					currentCluster.direction = "left"
				}
			}
		}
	},

	updateBoundaries: function ()
	{
		// this.startingRight = resizeCanvasData.currentWidth
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
	if(editingMode)
	{
		moveScreenBy = 300

		if(keyCode == 37)
		{
			scrollPos += moveScreenBy
		}
		else if(keyCode == 39)
		{
			scrollPos -= moveScreenBy
		}
		else if(keyCode == 38)
		{
			heightPos += moveScreenBy / 2
		}
		else if(keyCode == 40)
		{
			heightPos -= moveScreenBy / 2
		}
	}
	else
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

function logFrameRate()
{
	textSize(30)
	textAlign(LEFT)
	textFont(NESfont)
	fill(255)
	noStroke();
	if(frameCount % 50 == 0)
	{
		currentFrameRate = round(frameRate())
	}
	text("fps: " + currentFrameRate, resizeCanvasData.currentWidth - 150, 30)
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
		powerups.deactivatePowerups("both")
	} 
}

//--------------------RESIZE WINDOW FUNCTION--------------------//
function windowResized() {
	resizeCanvasData.currentWidth = windowWidth
	windowHeightDifference = (windowHeight - resizeCanvasData.currentHeight)
	resizeCanvasData.yCanvasTranslate += windowHeightDifference
	resizeCanvasData.currentHeight = windowHeight
	updateCanvasData()

	gameOver.updateMessageDimensions()
	resizeCanvas(windowWidth, windowHeight);
}

//--------------------CONTROLS BUTTONS--------------------//
function mousePressed()
{
	if(gameOver.onRestartButton(mouseX, mouseY) && gameOver.drawMessageBool == true)
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
