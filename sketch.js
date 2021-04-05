//global vars
var floorPos_y;
var currentGround;
var scrollPos;
var heightPos;
var currentLevel;
var NESfont;
var carrotCollectedSound;
var gameLoopSound;
var editingMode;

function preload()
{
	NESfont = loadFont('assets/fonts/NESfont.ttf')
	
	carrotCollectedSound = loadSound('assets/sounds/carrotCollected.mp3')
	lifeCollectedSound = loadSound('assets/sounds/heartCollected.mp3')
	gameLoopSound = loadSound('assets/sounds/gameLoop.mp3')
	gameLoopSound.setVolume(0.4) 
	familyCollectedSound = loadSound('assets/sounds/familyCollected.mp3')
	flowerCollectedSound = loadSound('assets/sounds/flowerCollected.mp3')
	gameOverSound = loadSound('assets/sounds/gameOver.mp3')
	heartCollectedSound = loadSound('assets/sounds/heartCollected.mp3')
	jumpSound = loadSound('assets/sounds/jump.mp3')
	jumpedOnEnemySound = loadSound('assets/sounds/jumpedOnEnemy.mp3')
	purpleCarrotCollectedSound = loadSound('assets/sounds/purpleCarrotCollected.mp3')
	superSpeedCollectedSound = loadSound('assets/sounds/superSpeedCollected.mp3')
	introSongSound = loadSound('assets/sounds/introSong.mp3')

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
	farmers.farmersArray = [];
	foxes.caves = [];
	powerups.powerupsArray = [];
	birds.clusters = [];
	child.drawChildBool = true;
	child.isFound =  false;

	frameRate(60)

	updateCanvasData()

	levelText = level.levelText
	levelTextWidth = level.levelTextWidth
	levelChildPosition = level.levelChildPosition

	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;
	foxes.caveColors = level.caveColors
	foxes.foxColors = level.foxColors
	foxes.addCaves(level.cavesData)

	statsBoard.refreshCurrentLevel()

	//update right starting pos of birds
	level.birdSettings.startingRight = resizeCanvasData.currentWidth + 100

	birds.birdColorData = level.birdColorData
	birds.settings = level.birdSettings
	birds.generateBirdClusters(level.birdClustersArray)

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
	farmers.farmerColors = {hatTop: color(level.hatTopColor),
		hatBottom: color(level.hatBottomColor),
		gunTop: color(level.gunTopColor),
		gunBottom: color(level.gunBottomColor),
		innerFoot: color(level.innerFootColor),
		outerFoot: color(level.outerFootColor),
		body: color(level.bodyColor),
		face: color(level.faceColor),
		bulletColor: color(level.bulletColor)}
	farmersArray = level.farmerPositionsArray
	farmers.addFarmers(farmersArray)
	child.setChildDimensions(level.childXPos, level.childYPos, level.childSize)
	child.colors = {platformColor: color(level.childPlatformColor)}

}

function draw()
{
	introOutro.drawIntro()
	introOutro.drawOutro()

	if(introOutro.isIntro.display || introOutro.isOutro){return}

	statsBoard.handlePlayerDeath()
	
	push();
	translate(0, resizeCanvasData.yCanvasTranslate)
	background(levels[currentLevel].skyColor);
	push();
    translate(scrollPos, heightPos);

	mountains.drawMountains()
	pop();
	pop();

	push();
	translate(0, heightPos)
	birds.drawBirdClusters()
	pop();

	push();
	translate(0, resizeCanvasData.yCanvasTranslate)
	push();
	translate(scrollPos, heightPos);
	trees.drawTrees()
	drawTerrain.drawCurrentTerrain(currentGround, currentPlatforms)
	farmers.bullets.updateExpiredBullets()
	foxes.updateFoxes()
	foxes.drawCaves()
	collectedAnimations.animateAnimations()
	canyons.drawCanyons();
	clouds.drawClouds();
	foxes.drawFoxes()
	farmers.bullets.drawBullets()
	farmers.drawFarmers()
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
	
	pop();
	
	statsBoard.drawBoard(levelText, levelTextWidth, levelChildPosition)
	statsBoard.drawCarrotsToStats()
	statsBoard.drawHeartsToStats()
	statsBoard.drawChildrenToStats()
	statsBoard.updateBoardScale()
	birds.updateBirdFlapping()
	birds.updateClusterRespawn()

	if(gameOver.drawMessageBool){gameOver.drawMessage()}

	powerups.superSizeSound()


	
}

//--------------------HANDLES RESPAWNING (NOT DEATH)--------------------//

function respawn()
{	
	scrollPos = levels[currentLevel].characterXStartScrollPos;
	heightPos = levels[currentLevel].characterYStartHeightPos;

	rabbitCharacter.yPos = levels[currentLevel].characterYStart 
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


//objects

//--------------------HANDLES INTRO OUTRO--------------------//
introOutro = 
{
	isIntro: {display: true, starting: false, duration: 600},

	foxData: [{xPos: null, yPos: null, size: null},
			{xPos: null, yPos: null, size: null},
			{xPos: null, yPos: null, size: null}],

	familyData: [{xPos: null, yPos: null, size: null, chasing: false},
			{xPos: null, yPos: null, size: null, captured: false},
			{xPos: null, yPos: null, size: null, captured: false},
			{xPos: null, yPos: null, size: null, captured: false}],

	familyDataSet: false,
	farmerData: {xPos: null, yPos: null, size: null},
	isOutro: false,
	xPos: 400,
	yPos: 500,
	size: 1,
	duration: 1000,

	updateDimensions: function()
	{
		this.yPos = resizeCanvasData.currentHeight * 0.6
	},

	updateFamilySize: function ()
	{
		this.xPos = resizeCanvasData.currentWidth / 2
	},

	drawIntro: function ()
	{
		this.updateDimensions()

		if(this.familyData[0].xPos > resizeCanvasData.currentWidth + 100)
		{
			this.isIntro.display = false;
		}

		if(this.foxData[2].xPos + (200 * this.size) > resizeCanvasData.currentWidth)
		{
			this.familyData[0].chasing = true;
		}

		this.updateFamilySize()

		if(!this.isIntro.display){return}

		if(this.isIntro.starting){this.isIntro.duration -= 1}

		if(!this.isIntro.starting)
		{
			this.familyData = [{xPos: this.xPos - (70 * this.size), yPos: this.yPos - (72 * this.size), size: 1 * this.size, chasing: false},
								{xPos: this.xPos + (40 * this.size), yPos: this.yPos - (96 * this.size), size: 1.4 * this.size, captured: false},
								{xPos: this.xPos - (150 * this.size), yPos: this.yPos - (40 * this.size), size: 0.5 * this.size, captured: false},
								{xPos: this.xPos + (140 * this.size), yPos: this.yPos - (40 * this.size), size: 0.5 * this.size, captured: false}]

			this.familyDataSet = true;
		}

		background('#EF90A8')

		x = this.xPos
		y = this.yPos
		s = this.size

		fill('#210000')
		rect(x - (400 * s), y - (10 * s), 800 * s, 10 * s) // underline
		drawRabbit(this.familyData[1].xPos, this.familyData[1].yPos, this.familyData[1].size, statsBoard.husbandData.outlineColor, statsBoard.husbandData.lightColor, statsBoard.husbandData.darkColor)
		drawRabbit(this.familyData[2].xPos, this.familyData[2].yPos, this.familyData[2].size, statsBoard.childrenData.outlineColor, statsBoard.childrenData.lightColor, statsBoard.childrenData.darkColor)
		drawRabbit(this.familyData[3].xPos, this.familyData[3].yPos, this.familyData[3].size, statsBoard.childrenData.outlineColor, statsBoard.childrenData.lightColor, statsBoard.childrenData.darkColor)

		this.updateFoxes()

	
		textFont(NESfont)
		textAlign(CENTER)
		noStroke();
		fill(255);
		textSize(130 * s)
		text("Sylvia", x, y - (320 * s))

		if(this.familyData[0].chasing == false)
		{
			drawRabbit(this.familyData[0].xPos, this.familyData[0].yPos, this.familyData[0].size, [0], [255, 130, 197], [255])
		}
		else
		{
			this.drawChasingRabbit()
			this.familyData[0].xPos += 3;
		}


		textSize(40 * s)
		fill(0)
		noStroke();
		if(frameCount % 40 <= 20 && !this.isIntro.starting)
		{
			text("PRESS ANY KEY TO PLAY", x, y + (200 * s))
		}
	},

	drawChasingRabbit: function ()
	{
		x = this.familyData[0].xPos
		y = this.familyData[0].yPos - (160 * this.size)
		s = this.familyData[0].size

		//control walking animation
		if(this.rabbitLegData.rightFootForward == true && frameCount % 7 == 0)
		{
			this.rabbitLegData.backLegs.outerLegHeight = 28 * s;
			this.rabbitLegData.backLegs.innerLegHeight = 34 * s;
			this.rabbitLegData.frontLegs.outerLegHeight = 34 * s;
			this.rabbitLegData.frontLegs.innerLegHeight = 28 * s;
			this.rabbitLegData.rightFootForward = false;
		}
		else if(this.rabbitLegData.rightFootForward == false && frameCount % 7 == 0)
		{
			this.rabbitLegData.backLegs.outerLegHeight = 34 * s;
			this.rabbitLegData.backLegs.innerLegHeight = 28 * s;
			this.rabbitLegData.frontLegs.outerLegHeight = 28 * s;
			this.rabbitLegData.frontLegs.innerLegHeight = 34 * s;
			this.rabbitLegData.rightFootForward = true;
		}


		strokeColor = [0]

		stroke(strokeColor); //black outline color
		strokeWeight(4 * s); //black outline width
		fill(255); // white color
		
		//main body part 1/2
		rect(x - (58 * s), y + (165 * s), 20 * s, 20 * s); //tail
		rect(x - (45 * s), y + (150 * s), 90 * s, 60 * s); //body
		//legs
		rect(x - (35 * s), y + (190 * s), 15 * s, this.rabbitLegData.backLegs.innerLegHeight);
		rect(x - (45 * s), y + (190 * s), 15 * s, this.rabbitLegData.backLegs.outerLegHeight);
		rect(x + (30 * s), y + (190 * s), 15 * s, this.rabbitLegData.frontLegs.innerLegHeight);
		rect(x + (20 * s), y + (190 * s), 15 * s, this.rabbitLegData.frontLegs.outerLegHeight);
		noStroke();
		rect(x - (43 * s), y + (152 * s), 86 * s, 56 * s); //body white inner rect (covers black outline of legs)
		
		stroke(strokeColor);
		strokeWeight(4 * s);

		push();
		translate(x + (10 * s) + ((20 * s) / 2), 
				y + (80 * s) + (40 * s)); //center of left ear (for rotation)
		angleMode(DEGREES);
		rect(-((20 * s) / 2), -(40 * s), 20 * s, 40 * s); //left ear
		fill(255, 130, 197); // pink color
		stroke(255, 130, 197); // pink color
		rect(0, -(25 * s), 5 * s, 20 * s); //left inner ear
		pop();

		push();
		translate(x + (45 * s) + ((20 * s) / 2), 
				y + (80 * s) + (40 * s)); //center of right ear (for rotation)
		angleMode(DEGREES);
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
		noStroke();
	},

	updateFoxes: function ()
	{
		duration = this.isIntro.duration

		if(duration < 500)
		{
			this.foxData[0].xPos += 5

			if(dist(this.foxData[0].xPos, this.yPos, this.familyData[1].xPos, this.yPos) < 100 * this.size)
			{
				if(!this.familyData[1].captured)
				{
					this.familyData[1].yPos -= 20
					this.familyData[1].captured = true
				}
				this.familyData[1].xPos = this.foxData[0].xPos + 100
			}
		}

		if(duration < 400)
		{
			this.foxData[1].xPos += 5
			if(dist(this.foxData[1].xPos, this.yPos, this.familyData[2].xPos, this.yPos) < 100 * this.size)
			{
				if(!this.familyData[2].captured)
				{
					this.familyData[2].yPos -= 60 * this.size
					this.familyData[2].captured = true
				}
				this.familyData[2].xPos = this.foxData[1].xPos + (100 * this.size)
			}
		}

		if(duration < 300)
		{
			this.foxData[2].xPos += 5

			if(dist(this.foxData[2].xPos, this.yPos, this.familyData[3].xPos, this.yPos) < 100 * this.size)
			{
				if(!this.familyData[3].captured)
				{
					this.familyData[3].yPos -= 60 * this.size
					this.familyData[3].captured = true
				}
				this.familyData[3].xPos = this.foxData[2].xPos + (100 * this.size)
			}
		}

		for(foxIdx = 0; foxIdx < this.foxData.length; foxIdx++)
		{
			this.drawFoxes(this.foxData[foxIdx].xPos, this.foxData[foxIdx].yPos, this.foxData[foxIdx].size)
		}
	},

	startKidnappers: function ()
	{
		this.foxData[0].yPos = this.yPos - (10 * this.size)
		this.foxData[1].yPos = this.yPos - (10 * this.size)
		this.foxData[2].yPos = this.yPos - (10 * this.size)

		this.foxData[0].xPos = 0 - (150 * this.size);
		this.foxData[1].xPos = 0 - (150 * this.size);
		this.foxData[2].xPos = 0 - (150 * this.size);

		this.foxData[0].size = 1.5 * this.size
		this.foxData[1].size = 1.5 * this.size
		this.foxData[2].size = 1.5 * this.size	

		this.farmerData = {xPos: 0 - (150 * this.size), 
						yPos: this.yPos - (65 * this.size), 
						size: 1.4 * this.size}
	},

	foxLegData: 
	{
		//initialize fox data used to control walking animation
		rightFootForward: true,
		backLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null,  innerLegHeight: null},
		frontLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null, innerLegHeight: null}
	},

	rabbitLegData:
	{
		//initialize fox data used to control walking animation
		rightFootForward: true,
		backLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null,  innerLegHeight: null},
		frontLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null, innerLegHeight: null}
	},

	drawFoxes: function (x, y, s)
	{
		noStroke();

		//control walking animation
		if(this.foxLegData.rightFootForward == true && frameCount % 7 == 0)
		{
			this.foxLegData.backLegs.outerLegHeight = 28 * s;
			this.foxLegData.backLegs.innerLegHeight = 34 * s;
			this.foxLegData.frontLegs.outerLegHeight = 34 * s;
			this.foxLegData.frontLegs.innerLegHeight = 28 * s;
			this.foxLegData.rightFootForward = false;
		}
		else if(this.foxLegData.rightFootForward == false && frameCount % 7 == 0)
		{
			this.foxLegData.backLegs.outerLegHeight = 34 * s;
			this.foxLegData.backLegs.innerLegHeight = 28 * s;
			this.foxLegData.frontLegs.outerLegHeight = 28 * s;
			this.foxLegData.frontLegs.innerLegHeight = 34 * s;
			this.foxLegData.rightFootForward = true;
		}

		foxLightColor = [255, 127, 9]
		foxDarkColor = [206, 44, 0]
		foxHighlightColor = [216, 220, 226]
		foxOutlineColor = [77, 18, 0]
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
		rect(x - (50 * s), y + (190 * s), 15 * s, this.foxLegData.backLegs.innerLegHeight);
		rect(x + (30 * s), y + (190 * s), 15 * s, this.foxLegData.frontLegs.innerLegHeight);
		
		//inner leg styling
		fill(foxOutlineColor)
		rect(x - (50 * s), y + (180 * s) + this.foxLegData.backLegs.innerLegHeight, 15 * s, 10 * s);
		rect(x + (30 * s), y + (180 * s) + this.foxLegData.frontLegs.innerLegHeight, 15 * s, 10 * s);


		fill(foxDarkColor)
		//outer legs
		rect(x - (60 * s), y + (190 * s), 15 * s, this.foxLegData.backLegs.outerLegHeight);
		rect(x + (20 * s), y + (190 * s), 15 * s, this.foxLegData.frontLegs.outerLegHeight);

		//outer leg styling
		fill(foxOutlineColor)
		rect(x - (60 * s), y + (175 * s) + this.foxLegData.backLegs.outerLegHeight, 15 * s, 15 * s);
		rect(x + (20 * s), y + (175 * s) + this.foxLegData.frontLegs.outerLegHeight, 15 * s, 15 * s);

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

	},

	drawOutro: function ()
	{
		if(!this.isOutro){return}
		
		background('#EF90A8')

		x = resizeCanvasData.currentWidth / 2
		y = gameOver.distFromEdgeY
		s = (resizeCanvasData.currentWidth + resizeCanvasData.currentHeight) / 4000

		//DRAW FAMILY
		drawRabbit(x - (70 * s), y - (72 * s), 1 * s, [0], [255, 130, 197], [255])
		drawRabbit(x + (40 * s), y - (96 * s), 1.4 * s, statsBoard.husbandData.outlineColor, statsBoard.husbandData.lightColor, statsBoard.husbandData.darkColor)
		drawRabbit(x - (150 * s), y - (40 * s), 0.5 * s, statsBoard.childrenData.outlineColor, statsBoard.childrenData.lightColor, statsBoard.childrenData.darkColor)
		drawRabbit(x + (140 * s), y - (40 * s), 0.5 * s, statsBoard.childrenData.outlineColor, statsBoard.childrenData.lightColor, statsBoard.childrenData.darkColor)

		noStroke();
		fill('#210000')
		rect(x - (400 * s), y - (10 * s), 800 * s, 10 * s)


		//DRAW STATS
		textFont(NESfont)
		//SPACING OF LINES
		fromTop = (gameOver.distFromEdgeY + resizeCanvasData.currentHeight / 10)
		fromBottom = (resizeCanvasData.currentHeight)
		lineSpacing = abs(fromTop - fromBottom) / 8

		fill(255);
		stroke(230);
		strokeWeight(lineSpacing / 10)
		
		noStroke();
		fill(255);

		//GAME OVER text
		gameOverTextSize = (resizeCanvasData.currentWidth + resizeCanvasData.currentHeight) / 35
		textSize(gameOverTextSize)
		textAlign(CENTER);
		text('Congratulations! You won!', resizeCanvasData.currentWidth/2, fromTop )

		statsTextSize = (resizeCanvasData.currentWidth + resizeCanvasData.currentHeight) / 60
		textSize(statsTextSize)

		//LEFT ALIGNED TEXT
		textAlign(LEFT);
		distFromLeft = gameOver.distFromEdgeX + 20
		text('SCORE: ' + (round((statsBoard.score / statsBoard.totalScore) * 100))+ "%", distFromLeft, fromTop + lineSpacing * 2 - (statsTextSize / 2))
		text('Carrots Collected', distFromLeft, fromTop + lineSpacing * 3 - (statsTextSize / 2))
		text('Farmers Killed', distFromLeft, fromTop + lineSpacing * 4 - (statsTextSize / 2))
		text('Fox Caves Collected', distFromLeft, fromTop + lineSpacing * 5 - (statsTextSize / 2))
		text('Hearts Left', distFromLeft, fromTop + lineSpacing * 6 - (statsTextSize / 2))
		text('Family Collected', distFromLeft, fromTop + lineSpacing * 7 - (statsTextSize / 2))

		//RIGHT ALIGNED TEXT
		textAlign(RIGHT);
		distFromRight = resizeCanvasData.currentWidth - gameOver.distFromEdgeX - 20
		text(statsBoard.score+"/"+statsBoard.totalScore, distFromRight, fromTop + lineSpacing * 2 - (statsTextSize / 2))
		text(statsBoard.carrots.totalCollected+'/'+statsBoard.carrots.total, distFromRight, fromTop + lineSpacing * 3 - (statsTextSize / 2))
		text(statsBoard.farmers.totalKilled+'/'+statsBoard.farmers.total, distFromRight, fromTop + lineSpacing * 4 - (statsTextSize / 2))
		text(statsBoard.caves.totalCollected+'/'+statsBoard.caves.total, distFromRight, fromTop + lineSpacing * 5 - (statsTextSize / 2))
		text(statsBoard.lives.current+'/'+statsBoard.lives.total, distFromRight, fromTop + lineSpacing * 6 - (statsTextSize / 2))
		text(currentLevel+'/'+levels.length, distFromRight, fromTop + lineSpacing * 7 - (statsTextSize / 2))


	}

}

//--------------------HANDLES COLLISION BOUNDARIES--------------------//
collisionBoundaryData = 
{
	friendlyObject: 35,
	friendlyObjectSuperSize: 70,
	bullet: 15,
	bulletSuperSize: 30,
	fox: 20,
	foxSuperSize:  40
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

	onButtonColor: ['#091F4E'],

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

	drawMessage: function ()
	{
		textFont(NESfont)
		//SPACING OF LINES
		fromTop = (this.distFromEdgeY)
		fromBottom = (resizeCanvasData.currentHeight - this.distFromEdgeY)
		lineSpacing = abs(fromTop - fromBottom) / 8

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
		text('SCORE: ' + (round((statsBoard.score / statsBoard.totalScore) * 100))+ "%", distFromLeft, fromTop + lineSpacing * 2 - (statsTextSize / 2))
		text('Carrots Collected', distFromLeft, fromTop + lineSpacing * 3 - (statsTextSize / 2))
		text('Farmers Killed', distFromLeft, fromTop + lineSpacing * 4 - (statsTextSize / 2))
		text('Fox Caves Collected', distFromLeft, fromTop + lineSpacing * 5 - (statsTextSize / 2))
		text('Hearts Left', distFromLeft, fromTop + lineSpacing * 6 - (statsTextSize / 2))
		text('Family Collected', distFromLeft, fromTop + lineSpacing * 7 - (statsTextSize / 2))

		//RIGHT ALIGNED TEXT
		textAlign(RIGHT);
		distFromRight = resizeCanvasData.currentWidth - this.distFromEdgeX - 20
		text(statsBoard.score+"/"+statsBoard.totalScore, distFromRight, fromTop + lineSpacing * 2 - (statsTextSize / 2))
		text(statsBoard.carrots.totalCollected+'/'+statsBoard.carrots.total, distFromRight, fromTop + lineSpacing * 3 - (statsTextSize / 2))
		text(statsBoard.farmers.totalKilled+'/'+statsBoard.farmers.total, distFromRight, fromTop + lineSpacing * 4 - (statsTextSize / 2))
		text(statsBoard.caves.totalCollected+'/'+statsBoard.caves.total, distFromRight, fromTop + lineSpacing * 5 - (statsTextSize / 2))
		text(statsBoard.lives.current+'/'+statsBoard.lives.total, distFromRight, fromTop + lineSpacing * 6 - (statsTextSize / 2))
		text(currentLevel+'/'+levels.length, distFromRight, fromTop + lineSpacing * 7 - (statsTextSize / 2))


		//SHARE BUTTON
		rectDimensions = lineSpacing
		this.shareDimensions = {xLeft: distFromRight - rectDimensions, 
								xRight: distFromRight - rectDimensions + rectDimensions, 
								yTop: fromTop + lineSpacing * 6.9, 
								yBottom: fromTop + lineSpacing * 6.9 + rectDimensions}
		fillColor = 230
		if(this.onShareButton(mouseX, mouseY))
		{
			fillColor = color(this.onButtonColor)
			cursor('pointer')
		}
		fill(fillColor);
		rect(distFromRight - rectDimensions, fromTop + lineSpacing * 6.9, rectDimensions, rectDimensions, rectDimensions / 15)
		

		//SHARE ICON
		x = distFromRight - rectDimensions + (rectDimensions / 2)
		y = fromTop + lineSpacing * 6.95 + (lineSpacing /2)
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

		//RESTART BUTTON
		rectWidth = resizeCanvasData.currentWidth / 5
		this.restartDimensions = {xLeft: resizeCanvasData.currentWidth/2 - (rectWidth / 2), 
								xRight: resizeCanvasData.currentWidth/2 - (rectWidth / 2) + rectWidth, 
								yTop: fromTop + lineSpacing * 6.9, 
								yBottom: fromTop + lineSpacing * 6.9 + lineSpacing}
		fillColor = 100
		if(this.onRestartButton(mouseX, mouseY))
		{
			fillColor = color(this.onButtonColor)
			cursor('pointer')
		}

		fill(fillColor);
		rect(width/2 - (rectWidth / 2), fromTop + lineSpacing * 6.9, rectWidth, lineSpacing, rectWidth / 30)
		
		textAlign(CENTER)
		fill(255, 255, 255)
		text('RESTART', resizeCanvasData.currentWidth/2, fromTop + lineSpacing * 7.5)

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
		lightStone: null,
		darkStone: null,
		inside: null
	},

	foxColors:
	{
		darkFurLight: null,
		darkFurDark: null,
		highlights: null,
		outlineColor: null
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
					powerups.addPowerups([{xPos: currentCave.xPos, yPos: currentCave.yPos - (100 * s), size: 0.2, type: "size", fromCave: true, fromFarmer: false}])
				}
				else if(currentCave.dropPowerupType == "speed")
				{
					powerups.addPowerups([{xPos: currentCave.xPos, yPos: currentCave.yPos - (100 * s), size: 0.2, type: "speed", fromCave: true, fromFarmer: false}])
				}
				else if(currentCave.dropPowerupType == "flower")
				{
					powerups.addPowerups([{xPos: currentCave.xPos, yPos: currentCave.yPos - (100 * s), size: 0.25, type: "flower", fromCave: true, fromFarmer: false}])
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
					playSound("jumpedOnEnemy")
					rabbitCharacter.earRotationData.currentlyRotating = true;
					rabbitCharacter.jumpingData.goingUpwards = true;
					rabbitCharacter.earRotationData.customRotationValue = rabbitCharacter.jumpingData.defaultJumpDuration * 0.5
					rabbitCharacter.jumpingData.jumpingDuration = round(rabbitCharacter.jumpingData.defaultJumpDuration * 0.5)
					rabbitCharacter.userInput.airCondition = "jumping"
				}

				//helper function that checks for whether player is killed by fox
				//run only if invulnerability period has expired
				if(powerups.superSizeData.invulnerablePeriod <= 0)
				{
					this.checkPlayerKilledByFox(currentFox)
				}
				
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
					if(currentFox.yPos > resizeCanvasData.currentHeight + 200)
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
					if(currentFox.yPos > resizeCanvasData.currentHeight + 200)
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

		jumpedOnY = currentFox.yPos - (35 * s)

		if(currentFox.direction == "left")
		{
			jumpedOnXRight= currentFox.xPos + (25 * s)
			jumpedOnXLeft = currentFox.xPos - (50 * s)
		}
		else if(currentFox.direction == "right")
		{
			jumpedOnXRight= currentFox.xPos + (35 * s)
			jumpedOnXLeft = currentFox.xPos - (40 * s)
		}
		else if(currentFox.direction == "front")
		{
			jumpedOnY += 10 * s
			jumpedOnXRight= currentFox.xPos + (5 * s)
			jumpedOnXLeft = currentFox.xPos - (5 * s)
		}

		jumpedOnXMiddle = (jumpedOnXRight + jumpedOnXLeft) * 0.5

		if(powerups.superSizeData.superSized)
		{
			distanceThatCountsAsDeath = collisionBoundaryData.foxSuperSize
		}
		else
		{
			distanceThatCountsAsDeath = collisionBoundaryData.fox
		}
		
		rabbitCenterY = rabbitCharacter.getCenterPos() - heightPos

		if(currentFox.isOutside)
		{
			if(dist(jumpedOnXRight, jumpedOnY, rabbitCharacter.realWorldPos, rabbitCenterY) < distanceThatCountsAsDeath || 
				dist(jumpedOnXLeft, jumpedOnY, rabbitCharacter.realWorldPos, rabbitCenterY) < distanceThatCountsAsDeath || 
				dist(jumpedOnXMiddle, jumpedOnY, rabbitCharacter.realWorldPos, rabbitCenterY) < distanceThatCountsAsDeath)
			{
				if(currentFox.isDead == false)
				{
					playSound("gameOver")
				}
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
					powerups.deactivatePowerups("both")
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
	levels[currentLevel].scrollPosLeft = resizeCanvasData.currentWidth * 0.4
	levels[currentLevel].scrollPosRight = resizeCanvasData.currentWidth * 0.6
	levels[currentLevel].heightPosTop = resizeCanvasData.currentHeight * 0.4
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
	for(i = 0; i < levels[currentLevel].farmerPositionsArray.length; i++)
	{
		levels[currentLevel].farmerPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].cavesData.length; i++)
	{
		levels[currentLevel].cavesData[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].powerupPositionsArray.length; i++)
	{
		levels[currentLevel].powerupPositionsArray[i].yPos += resizeCanvasData.yObjStart
	}
	for(i = 0; i < levels[currentLevel].birdClustersArray.length; i++)
	{
		levels[currentLevel].birdClustersArray[i].yPos += resizeCanvasData.yObjStart
	}

	levels[currentLevel].characterYStart += resizeCanvasData.yObjStart

	levels[currentLevel].childYPos += resizeCanvasData.yObjStart
}

//--------------------LEVELS OBJECT (STORES LEVEL DATA)--------------------//
levels = 
[
	//level 1
	{
		//level data
		levelText: "Level 1: Rescue your daughter Ophelia",
		levelTextWidth: 675,
		levelChildPosition: [1025, 28, 0.22],
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
		//bird data
		birdSettings: {startingLeft: -100, startingRight: resizeCanvasData.currentWidth + 100, frequency: 200, clusterSpeed: 3, flapSpeed: 3, xRandom: 200, yRandom: 200, numOfBirds: 20, scale: 0.2},
		birdClustersArray: [{yPos: 0}, {yPos: -500}],
		birdColorData: {birdLight: [57, 26, 28], birdDark: [7, 2, 0], birdBeak: [250, 164, 28]},
		//fox data
		caveColors: {lightStone: [187, 192, 200], darkStone: [101, 115, 126], inside: [33, 14, 0]},
		foxColors: {darkFurLight: [255, 127, 9], darkFurDark: [206, 44, 0], highlights: [216, 220, 226], outlineColor: [77, 18, 0]},
		cavesData: [{xPos: 2790, yPos: 432, size: 0.5, direction: "left", numOfFoxes: 2, foxSpeed: 2, foxGap: 200, maxNumOfLives: 1, maxNumberOfFoxesOut: 1, dropPowerupType: "speed"},
					{xPos: 4680, yPos: 432, size: 0.5, direction: "left", numOfFoxes: 3, foxSpeed: 3, foxGap: 150, maxNumOfLives: 1, maxNumberOfFoxesOut: 2, dropPowerupType: "size"},
					{xPos: 5300, yPos: 432, size: 0.5, direction: "right", numOfFoxes: 2, foxSpeed: 4, foxGap: 100, maxNumOfLives: 1, maxNumberOfFoxesOut: 2, dropPowerupType: "flower"}],
		//powerup data
		//powerup format {xPos: 320, yPos: 380, size: 0.25, type: "flower", fromCave: false, fromFarmer: false}
		powerupPositionsArray: [],
		//carrot data
		carrotColor: ['#EE891F'],
		carrotStemColor: [35, 92, 70],
		carrotPositionsArray: 
			[{xPos: 780, yPos: 384, size: 0.2},
			{xPos: 1185, yPos: 200, size: 0.2},
			{xPos: 1575, yPos: 200, size: 0.2},
			{xPos: 2300, yPos: 384, size: 0.2},
			{xPos: 2500, yPos: 384, size: 0.2},
			{xPos: 3200, yPos: 384, size: 0.2},
			{xPos: 3500, yPos: 384, size: 0.2},
			{xPos: 3800, yPos: 384, size: 0.2},
			{xPos: 3400, yPos: 200, size: 0.2},
			{xPos: 3600, yPos: 200, size: 0.2},
			{xPos: 3850, yPos: 200, size: 0.2},
			{xPos: 4250, yPos: 384, size: 0.2},
			{xPos: 4450, yPos: 384, size: 0.2},
			{xPos: 4800, yPos: 200, size: 0.2},
			{xPos: 5100, yPos: 200, size: 0.2},
			{xPos: 6000, yPos: 384, size: 0.2},
			{xPos: 6400, yPos: 384, size: 0.2},
			{xPos: 7550, yPos: 18, size: 0.2},
			{xPos: 7850, yPos: -164, size: 0.2},
			{xPos: 8200, yPos: 384, size: 0.2},
			{xPos: 8500, yPos: 384, size: 0.2},
			{xPos: 8800, yPos: 384, size: 0.2}],
		//lives data
		livesColor: ['#E81B25'],
		heartPositionsArray: 
			[{xPos: 1350, yPos: 50, size: 0.3},
			{xPos: 5500, yPos: 60, size: 0.3},
			{xPos: 7250, yPos: 200, size: 0.3}],
		//ground data
		grassLight: [243,180,139],
		grassDark: [223,145,94],
		dirtLight: [208,183,172],
		dirtDark: [84,60,44],
		bedRockLight: [165,136,122],
		bedRockDark: [67,53,32],
		groundPositionsArray:
			[[200, 2000], 
			[2100, 3000], 
			[3100, 3900],
			[4000, 4800],
			[5150, 7000],
			[7100, 9500]],
		//canyon data
		canyonPositionsArray:
			[{xPos: 2000, canyonWidth: 100},
			{xPos: 3000, canyonWidth: 100},
			{xPos: 3900, canyonWidth: 100},
			{xPos: 4800, canyonWidth: 350},
			{xPos: 7000, canyonWidth: 100}],
		canyonColor: [208,227,204],
		//platform data
		platformPositionsArray:
			[{yPos: 250, platformStart: 1000, platformEnd: 1250},
			{yPos: 250, platformStart: 1450, platformEnd: 1700},
			{yPos: 100, platformStart: 1250, platformEnd: 1450},
			{yPos: 250, platformStart: 3300, platformEnd: 3950},
			{yPos: 250, platformStart: 4600, platformEnd: 5450},
			{yPos: 250, platformStart: 7100, platformEnd: 7400},
			{yPos: 68, platformStart: 7400, platformEnd: 7700},
			{yPos: -114, platformStart: 7700, platformEnd: 8000},
			{yPos: 250, platformStart: 9200, platformEnd: 9650}],
		platformGrassLight: [246,241,182],
		platformGrassDark: [238,231,153],
		platformDirtLight: [227,217,106],
		platformDirtDark: [210,198,71],
		platformBedRockLight: [185,151,20],
		platformBedRockDark: [161,126,7],
		//cloud data
		cloudPositionsArray: 
			[{xPos: 0, yPos: -100, direction: "right", speed: [5, 6], maxLeft: 0, maxRight: 3000},
			{xPos: 5400, yPos: 50, direction: "right", speed: [5, 6], maxLeft: 0, maxRight: 1500},
			{xPos: 8000, yPos: 50, direction: "right", speed: [2, 3], maxLeft: 0, maxRight: 700}],
		//mountain data
		sideMountainsColor: ['#A29F97'],
		middleMountainColor: ['#545351'],
		riverColor: ['#4EAAC7'],
		snowCapColor: ['#F6F2F2'],
		mountainPositionsArray:
			[{xPos: 400, yPos: 432, scale: 1},
			{xPos: 4250, yPos: 432, scale: 1.2},
			{xPos: 7720, yPos: 432, scale: 0.8}],
		//tree data
		leavesColor: [244, 225, 172],
		trunkColor: [120, 100, 40],
		treePositionsArray:
			[{xPos: 1120, yPos: 250, scale: 0.7},
			{xPos: 1900, yPos: 432, scale: 0.7},
			{xPos: 3500, yPos: 250, scale: 0.4},
			{xPos: 6200, yPos: 432, scale: 0.4}],
		//farmers data
		hatTopColor: [216, 120, 70],
		hatBottomColor: [159, 77, 40],
		gunTopColor: [128],
		gunBottomColor: [96],
		innerFootColor: [145,131,124],
		outerFootColor: [212,203,185],
		bodyColor: [100, 28, 14],
		faceColor: [191, 153, 115],
		bulletColor: [69],
		farmerPositionsArray:
			[{xPos: 5350, yPos: 210, scale: 1, firingFrequency: 120, firingSpeed: 6, maxBulletDistLeft: 225, maxBulletDistRight: 300, maxBulletDistIsX: false, dropPowerupType: ""},
			{xPos: 8095, yPos: 70, scale: 1, firingFrequency: 250, firingSpeed: 10, maxBulletDistLeft: 300, maxBulletDistRight: 300, maxBulletDistIsX: false, dropPowerupType: "speed"},
			{xPos: 9100, yPos: 392, scale: 1, firingFrequency: 120, firingSpeed: 6, maxBulletDistLeft: 300, maxBulletDistRight: 300, maxBulletDistIsX: false, dropPowerupType: "flower"}],
		//child data
		childXPos: 9450,
		childYPos: 218,
		childSize: 0.3,
		childPlatformColor: ['#72452B'],
		//yIdx updated (should only happen once)
		yIdxUpdated: false
	},
	//level 2
	{
		//level data
		levelText: "Level 2: Rescue your son Aurelio",
		levelTextWidth: 580,
		levelChildPosition: [935, 28, 0.22],
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
		skyColor: ['#D4E6EF'],
		//bird data
		birdSettings: {startingLeft: -100, startingRight: resizeCanvasData.currentWidth + 100, frequency: 200, clusterSpeed: 3, flapSpeed: 3, xRandom: 200, yRandom: 200, numOfBirds: 20, scale: 0.2},
		birdClustersArray: [{yPos: 0}, {yPos: -500}],
		birdColorData: {birdLight: ["#722407"], birdDark: ["#656972"], birdBeak: ["#050507"]},
		//fox data
		caveColors: {lightStone: [187, 192, 200], darkStone: [101, 115, 126], inside: [33, 14, 0]},
		foxColors: {darkFurLight: [219, 127, 114], darkFurDark: [203, 112, 99], highlights: [251, 234, 216], outlineColor: [77, 18, 0]},
		cavesData: [{xPos: 3790, yPos: -296, size: 0.5, direction: "left", numOfFoxes: 5, foxSpeed: 4, foxGap: 200, maxNumOfLives: 1, maxNumberOfFoxesOut: 5, dropPowerupType: "speed"},
					{xPos: 8760, yPos: -114, size: 0.5, direction: "left", numOfFoxes: 5, foxSpeed: 5, foxGap: 30, maxNumOfLives: 1, maxNumberOfFoxesOut: 5, dropPowerupType: "speed"}],
		//powerup data
		//powerup format {xPos: 320, yPos: 380, size: 0.25, type: "flower", fromCave: false, fromFarmer: false}
		powerupPositionsArray: [],
		//carrot data
		carrotColor: ['#EE891F'],
		carrotStemColor: [35, 92, 70],
		carrotPositionsArray: 
			[{xPos: 650, yPos: 384, size: 0.2},
			{xPos: 750, yPos: 384, size: 0.2},
			{xPos: 850, yPos: 384, size: 0.2},
			{xPos: 2600, yPos: 384, size: 0.2},
			{xPos: 2800, yPos: 384, size: 0.2},
			{xPos: 3000, yPos: 384, size: 0.2},
			{xPos: 2350, yPos: 120, size: 0.2},
			{xPos: 2830, yPos: -80, size: 0.2},
			{xPos: 4730, yPos: 384, size: 0.2},
			{xPos: 5950, yPos: 384, size: 0.2},
			{xPos: 6100, yPos: 384, size: 0.2},
			{xPos: 6250, yPos: 384, size: 0.2},
			{xPos: 7250, yPos: 384, size: 0.2},
			{xPos: 8000, yPos: 384, size: 0.2},
			{xPos: 8180, yPos: 384, size: 0.2},
			{xPos: 8360, yPos: 384, size: 0.2}],
		//lives data
		livesColor: ['#E81B25'],
		heartPositionsArray: 
			[{xPos: 1500, yPos: 382, size: 0.3},
			{xPos: 1700, yPos: 300, size: 0.3},
			{xPos: 1900, yPos: 300, size: 0.3},
			{xPos: 3625, yPos: -164, size: 0.3},
			{xPos: 7700, yPos: -164, size: 0.3},
			{xPos: 9900, yPos: 18, size: 0.3}],
		//ground data
		grassLight: ['#F7F7F7'],
		grassDark: ['#DDEBF7'],
		dirtLight: ['#B4DAF7'],
		dirtDark: ['#A1D2F6'],
		bedRockLight: ['#7CC2F7'],
		bedRockDark: ['#A0A0AA'],
		groundPositionsArray:
			[[200, 1600],
			[2310, 4900],
			[5000, 6750],
			[6900, 7000],
			[7050, 7150],
			[7200, 7300],
			[7350, 7450],
			[7500, 7600],
			[7750, 10000],
			[10900, 11900]],
		//canyon data
		canyonPositionsArray:
			[{xPos: 1600, canyonWidth: 710},
			{xPos: 4900, canyonWidth: 100},
			{xPos: 6750, canyonWidth: 150},
			{xPos: 7000, canyonWidth: 50},
			{xPos: 7150, canyonWidth: 50},
			{xPos: 7300, canyonWidth: 50},
			{xPos: 7450, canyonWidth: 50},
			{xPos: 7600, canyonWidth: 150},
			{xPos: 10000, canyonWidth: 900}],
		canyonColor: ['#D4E6EF'],
		//platform data
		platformPositionsArray:
			[{yPos: 350, platformStart: 1610, platformEnd: 2300},
			{yPos: 250, platformStart: 3400, platformEnd: 3700},
			{yPos: 68, platformStart: 3550, platformEnd: 3850},
			{yPos: -114, platformStart: 3400, platformEnd: 3700},
			{yPos: -296, platformStart: 3550, platformEnd: 3900},
			{yPos: 68, platformStart: 7100, platformEnd: 7400},
			{yPos: 250, platformStart: 7550, platformEnd: 7850},
			{yPos: -114, platformStart: 7350, platformEnd: 8900},
			{yPos: 250, platformStart: 9600, platformEnd: 9900},
			{yPos: 68, platformStart: 9750, platformEnd: 10050}],
		platformGrassLight: ['#E7E7E7'],
		platformGrassDark: ['#7D9FCD'],
		platformDirtLight: ['#4477BD'],
		platformDirtDark: ['#2B2F38'],
		platformBedRockLight: ['#454242'],
		platformBedRockDark: ['#030F22'],
		//cloud data
		cloudPositionsArray: 
			[{xPos: 2250, yPos: 100, direction: "right", speed: [3, 4], maxLeft: 0, maxRight: 960},
			{xPos: 2730, yPos: -90, direction: "right", speed: [3, 4], maxLeft: 0, maxRight: 480},
			{xPos: 10000, yPos: 200, direction: "right", speed: [4, 5], maxLeft: 0, maxRight: 750}],
		//mountain data
		sideMountainsColor: ['#A29F97'],
		middleMountainColor: ['#545351'],
		riverColor: ['#4EAAC7'],
		snowCapColor: ['#F6F2F2'],
		mountainPositionsArray:
			[{xPos: 3350, yPos: 432, scale: 2.1},
			{xPos: 8600, yPos: 432, scale: 2.7}],
		//tree data
		leavesColor: ['#EEEEEE'],
		trunkColor: ['#F7F7F7'],
		treePositionsArray:
			[{xPos: 250, yPos: 432, scale: 0.7},
			{xPos: 350, yPos: 432, scale: 0.9},
			{xPos: 430, yPos: 432, scale: 0.5},
			{xPos: 1320, yPos: 432, scale: 0.8},
			{xPos: 3800, yPos: 68, scale: 0.4},
			{xPos: 4500, yPos: 432, scale: 1.5},
			{xPos: 5500, yPos: 432, scale: 0.8},
			{xPos: 5650, yPos: 432, scale: 1.4},
			{xPos: 5800, yPos: 432, scale: 0.6},
			{xPos: 7900, yPos: -114, scale: 1.2},
			{xPos: 7500, yPos: -114, scale: 0.8},
			{xPos: 11800, yPos: 432, scale: 0.3},
			{xPos: 11750, yPos: 432, scale: 0.8},
			{xPos: 11650, yPos: 432, scale: 1.2},
			{xPos: 11400, yPos: 432, scale: 1},
			{xPos: 11450, yPos: 432, scale: 0.4}],
		//farmers data
		hatTopColor: ['#BD7F4A'],
		hatBottomColor: ['#A56F41'],
		gunTopColor: ['#A5A4A8'],
		gunBottomColor: ['#808285'],
		innerFootColor: ['#5F4025'],
		outerFootColor: ['#764F2D'],
		bodyColor: ['#482218'],
		faceColor: ['#A17758'],
		bulletColor: [69],
		farmerPositionsArray:
			[{xPos: 2150, yPos: 310, scale: 1, firingFrequency: 110, firingSpeed: 7, maxBulletDistLeft: 300, maxBulletDistRight: 300, maxBulletDistIsX: false, dropPowerupType: "size"},
			{xPos: 6600, yPos: 392, scale: 1, firingFrequency: 110, firingSpeed: 7, maxBulletDistLeft: 300, maxBulletDistRight: 300, maxBulletDistIsX: false, dropPowerupType: "size"},
			{xPos: 10090, yPos: 220, scale: 1, firingFrequency: 80, firingSpeed: 15, maxBulletDistLeft: 300, maxBulletDistRight: 300, maxBulletDistIsX: false, dropPowerupType: "flower"}],
		//child data
		childXPos: 11550,
		childYPos: 402,
		childSize: 0.3,
		childPlatformColor: ['#72452B'],
		//yIdx updated (should only happen once)
		yIdxUpdated: false
	},
	//level 3
	{
		//level data
		levelText: "Level 3: Rescue your husband Alfred",
		levelTextWidth: 650,
		levelChildPosition: [1001, 28, 0.22],
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
		skyColor: ['#81CDDC'],
		//bird data
		birdSettings: {startingLeft: -100, startingRight: resizeCanvasData.currentWidth + 100, frequency: 200, clusterSpeed: 3, flapSpeed: 3, xRandom: 200, yRandom: 200, numOfBirds: 20, scale: 0.2},
		birdClustersArray: [{yPos: 0}, {yPos: -500}],
		birdColorData: {birdLight: [57, 26, 28], birdDark: [7, 2, 0], birdBeak: [250, 164, 28]},
		//fox data
		caveColors: {lightStone: ['#65350F'], darkStone: ['#3C280D'], inside: ['#231709']},
		foxColors: {darkFurLight: [255, 127, 9], darkFurDark: [206, 44, 0], highlights: [216, 220, 226], outlineColor: [77, 18, 0]},
		cavesData: [{xPos: 7000, yPos: 432, size: 0.5, direction: "left", numOfFoxes: 8, foxSpeed: 8, foxGap: 120, maxNumOfLives: 1, maxNumberOfFoxesOut: 3, dropPowerupType: "size"},
					{xPos: 8400, yPos: 432, size: 0.5, direction: "left", numOfFoxes: 12, foxSpeed: 8, foxGap: 110, maxNumOfLives: 1, maxNumberOfFoxesOut: 3, dropPowerupType: "size"},
					{xPos: 9800, yPos: 432, size: 0.5, direction: "left", numOfFoxes: 16, foxSpeed: 8, foxGap: 100 , maxNumOfLives: 1, maxNumberOfFoxesOut: 3, dropPowerupType: "flower"}],
		//powerup data
		//powerup format {xPos: 320, yPos: 380, size: 0.25, type: "flower", fromCave: false, fromFarmer: false}
		powerupPositionsArray: [],
		//carrot data
		carrotColor: ['#EE891F'],
		carrotStemColor: [35, 92, 70],
		carrotPositionsArray: 
			[{xPos: 2450, yPos: -350, size: 0.2},
			{xPos: 2550, yPos: -350, size: 0.2},
			{xPos: 2650, yPos: -350, size: 0.2},
			{xPos: 2750, yPos: -350, size: 0.2},
			{xPos: 2850, yPos: -350, size: 0.2},
			{xPos: 2950, yPos: -350, size: 0.2},
			{xPos: 3050, yPos: -350, size: 0.2}],
		//lives data
		livesColor: ['#E81B25'],
		heartPositionsArray: 
			[{xPos: 900, yPos: 384, size: 0.3},
			{xPos: 1433, yPos: 384, size: 0.3},
			{xPos: 1966, yPos: 384, size: 0.3},
			{xPos: 2500, yPos: 384, size: 0.3},
			{xPos: 3600, yPos: -80, size: 0.3},
			{xPos: 4500, yPos: 384, size: 0.3}],
		//ground data
		grassLight: ['#FCF3A2'],
		grassDark: ['#FBEA76'],
		dirtLight: ['#F7D12A'],
		dirtDark: ['#AF682F'],
		bedRockLight: ['#813F0D'],
		bedRockDark: ['#7A3903'],
		groundPositionsArray:
			[[200, 2550],
			[3800, 5500],
			[5600, 10000],
			[10200, 13350]],
		//canyon data
		canyonPositionsArray:
			[{xPos: 2550, canyonWidth: 1250},
			{xPos: 5500, canyonWidth: 100},
			{xPos: 10000, canyonWidth: 200}],
		canyonColor: ['#81CDDC'],
		//platform data
		platformPositionsArray:
			[{yPos: -300, platformStart: 2400, platformEnd: 3100},
			{yPos: -30, platformStart: 3100, platformEnd: 3800}],
		platformGrassLight: ['#795C34'],
		platformGrassDark: ['#7E481C'],
		platformDirtLight: ['#65350F'],
		platformDirtDark: ['#3C280D'],
		platformBedRockLight: ['#301703'],
		platformBedRockDark: ['#231709'],
		//cloud data
		cloudPositionsArray: 
			[{xPos: 1000, yPos: 242, direction: "right", speed: [2, 3], maxLeft: 0, maxRight: 1210},
			{xPos: 2210, yPos: 147, direction: "right", speed: [5, 6], maxLeft: 1210, maxRight: 0},
			{xPos: 1000, yPos: -43, direction: "right", speed: [5, 6], maxLeft: 0, maxRight: 1210},
			{xPos: 2210, yPos: 52, direction: "right", speed: [2, 3], maxLeft: 1210, maxRight: 0},
			{xPos: 1000, yPos: -138, direction: "right", speed: [2, 3], maxLeft: 0, maxRight: 1210},
			{xPos: 2210, yPos: -223, direction: "right", speed: [5, 6], maxLeft: 1210, maxRight: 0}],
		//mountain data
		sideMountainsColor: [188,148,90],
		middleMountainColor: [238,206,160],
		riverColor: [238,206,160],
		snowCapColor: [238,206,160],
		mountainPositionsArray:
			[{xPos: 1700, yPos: 432, scale: 4.1},
			{xPos: 12700, yPos: 432, scale: 3.3}],
		//tree data
		leavesColor: ['#1A4321'],
		trunkColor: [120, 100, 40],
		treePositionsArray:
			[{xPos: 5300, yPos: 432, scale: 1.5},
			{xPos: 5100, yPos: 432, scale: 0.8},
			{xPos: 4950, yPos: 432, scale: 1.4},
			{xPos: 4800, yPos: 432, scale: 0.6},
			{xPos: 10500, yPos: 432, scale: 0.6},
			{xPos: 10700, yPos: 432, scale: 0.8},
			{xPos: 10900, yPos: 432, scale: 1.4},
			{xPos: 11100, yPos: 432, scale: 0.3}],
		//farmers data
		hatTopColor: ['#BD7F4A'],
		hatBottomColor: ['#A56F41'],
		gunTopColor: ['#A5A4A8'],
		gunBottomColor: ['#808285'],
		innerFootColor: ['#5F4025'],
		outerFootColor: ['#764F2D'],
		bodyColor: ['#482218'],
		faceColor: ['#A17758'],
		bulletColor: [69],
		farmerPositionsArray:
			[{xPos: 1100, yPos: 270, scale: 1, firingFrequency: 190, firingSpeed: 12, maxBulletDistLeft: 600, maxBulletDistRight: 600, maxBulletDistIsX: false, dropPowerupType: "speed"},
			{xPos: 2310, yPos: 80, scale: 1, firingFrequency: 190, firingSpeed: 12, maxBulletDistLeft: 600, maxBulletDistRight: 600, maxBulletDistIsX: false, dropPowerupType: "size"},
			{xPos: 1100, yPos: -110, scale: 1, firingFrequency: 190, firingSpeed: 12, maxBulletDistLeft: 600, maxBulletDistRight: 600, maxBulletDistIsX: false, dropPowerupType: "flower"}],
		//child data
		childXPos: 12000,
		childYPos: 402,
		childSize: 0.3,
		childPlatformColor: ['#72452B'],
		//yIdx updated (should only happen once)
		yIdxUpdated: false
	},
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
		defaultDuration: 1800,
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

	superSizeSound: function ()
	{
		if(this.superSizeData.superSized)
		{
			if(!purpleCarrotCollectedSound.isPlaying()){purpleCarrotCollectedSound.loop()}
			if(gameLoopSound.isPlaying()){gameLoopSound.pause()}
		}
		else
		{
			if(purpleCarrotCollectedSound.isPlaying()){purpleCarrotCollectedSound.stop()}
			if(!gameLoopSound.isPlaying()){gameLoopSound.loop()}
			if(introSongSound.isPlaying()){introSongSound.stop()}


		}
	},

	superSpeedData:
	{
		isActive: false,
		defaultDuration: 1800,
		duration: 0,
		yellowColor: [255, 238, 117],
		outlineColor: [14, 27, 79]
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
		
		fill(color(this.superSpeedData.yellowColor))
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

		fill(this.superSpeedData.outlineColor)
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
		fill(this.superSpeedData.yellowColor)
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
		petalColorLight: [242, 174, 46],
		petalColorMedium: [239, 143, 55],
		petalColorDark: [219, 83, 61]
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

	createPowerup: function (x, y, s, type, fromCave, fromFarmer)
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
			fromFarmer: fromFarmer,
			downAnimation: true,
			beenCollected: false,
			powerupFloorPosY: y + (s * 112),
			inProximity: function (charX, charY)
			{
				powerupX = this.x
				powerupY = this.currentYPos + (10 * this.size)

				powerupRadius = collisionBoundaryData.friendlyObject

				if(powerups.superSizeData.superSized)
				{
					powerupRadius = collisionBoundaryData.friendlyObjectSuperSize
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
			this.powerupsArray.push(this.createPowerup(powerupsInput[i].xPos, powerupsInput[i].yPos + 20, powerupsInput[i].size, powerupsInput[i].type, powerupsInput[i].fromCave, powerupsInput[i].fromFarmer))
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
						playSound("superSpeedCollected")
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
						playSound("flowerCollected")
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
					sizeUpdate = (0.05 - p.size) / duration

					this.powerupsToCharArray.push({xPos: p.x, 
													yPos: p.y, 
													size: p.size, 
													lifeSpan: duration,
													xUpdate: xUpdate, 
													yUpdate: yUpdate, 
													sizeUpdate: sizeUpdate,
													type: p.type,
													fromCave: p.fromCave,
													fromFarmer: p.fromFarmer})

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

			if(currentPower.yPos + heightPos > rabbitCharacter.getCenterPos())
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
				else if(currentPower.fromFarmer)
				{
					statsBoard.itemCollected("farmer")
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
				childBoardSize = levels[currentLevel].levelChildPosition[2] * statsBoard.boardScale.scale
				childBoardX = (levels[currentLevel].levelChildPosition[0] * statsBoard.boardScale.scale) + statsBoard.boardScale.x
				childBoardY = (levels[currentLevel].levelChildPosition[1] * statsBoard.boardScale.scale) + statsBoard.boardScale.y
				statsBoard.childrenToStatsArray.push({
							xPos: this.xPos + scrollPos, 
							yPos: this.yPos + heightPos, 
							size: this.size, 
							lifeSpan: duration,
							xUpdate: abs((this.xPos + scrollPos) - (childBoardX)) / duration, 
							yUpdate: abs((this.yPos + heightPos) - (childBoardY)) / duration, 
							sizeUpdate: ((childBoardSize) - this.size) / duration})
				
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

		if(currentLevel == 2)
		{
			outlineColor = statsBoard.husbandData.outlineColor
			lightColor = statsBoard.husbandData.lightColor
			darkColor = statsBoard.husbandData.darkColor
			s = 0.6
			y -= 16
		}
		else
		{
			outlineColor = statsBoard.childrenData.outlineColor
			lightColor = statsBoard.childrenData.lightColor
			darkColor = statsBoard.childrenData.darkColor
		}
		

		if(this.drawChildBool)
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
			playSound("familyCollected")
			this.isFound = true;
			statsBoard.addPoints(statsBoard.pointQuantities.child)
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
			heartFloorPosY: y + (s * 96),
			inProximity: function (charX, charY)
			{
				heartX = this.x
				heartY = this.currentYPos + (10 * this.size)

				heartRadius = collisionBoundaryData.friendlyObject

				if(powerups.superSizeData.superSized)
				{
					heartRadius = collisionBoundaryData.friendlyObjectSuperSize
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
		x: 20,
		y: 20,
		scale: 1,
	},

	updateBoardScale: function ()
	{
		currentBoardWidth = this.boardScale.x + (1028 * this.boardScale.scale)

		originalBoardWidth = 400 + levels[currentLevel].levelTextWidth

		if(resizeCanvasData.currentWidth <= currentBoardWidth)
		{
			this.boardScale.scale *= 0.9
		}
		else if(resizeCanvasData.currentWidth - (100 * this.boardScale.scale) > currentBoardWidth && currentBoardWidth < originalBoardWidth)
		{
			this.boardScale.scale *= 1.1
		}
	},

	score: 0,

	totalScore: null,

	deathHandled: false,

	updateTotals: function ()
	{
		carrotTotal = 0;
		farmerTotal = 0;
		livesTotal = 0;
		cavesTotal = 0;

		//calculate totals from all level data
		for(i = 0; i < levels.length; i++)
		{
			carrotTotal += levels[i].carrotPositionsArray.length
			livesTotal += levels[i].heartPositionsArray.length
			farmerTotal += levels[i].farmerPositionsArray.length
			cavesTotal += levels[i].cavesData.length
		}

		//calculate cave powerup totals
		caveTotalPowerupScore = 0
		numberOfFoxes = 0 
		numberOfFoxLives = 0 

		for(i = 0; i < levels.length; i++)
		{
			for(caveIdx = 0; caveIdx < levels[i].cavesData.length; caveIdx++)
			{
				//POWERUP SCORES
				if(levels[i].cavesData[caveIdx].dropPowerupType == "speed")
				{
					caveTotalPowerupScore += this.pointQuantities.speed
				}
				else if(levels[i].cavesData[caveIdx].dropPowerupType == "size")
				{
					caveTotalPowerupScore += this.pointQuantities.size
				}
				else if(levels[i].cavesData[caveIdx].dropPowerupType == "flower")
				{
					caveTotalPowerupScore += this.pointQuantities.flower
				}

				//FOXES SCORE
				numberOfFoxes += levels[i].cavesData[caveIdx].numOfFoxes
			}
		}

		numberOfFoxLives = numberOfFoxes

		childrenTotal = levels.length - 1; //one less than all levels (last level finds wife)

		this.lives.total = livesTotal
		this.farmers.total = farmerTotal
		this.carrots.total = carrotTotal
		this.caves.total = cavesTotal

		this.totalScore = (livesTotal * this.pointQuantities.life) + 
						(carrotTotal * this.pointQuantities.carrot) + 
						(farmerTotal * this.pointQuantities.farmer) + 
						(childrenTotal * this.pointQuantities.child) +
						(numberOfFoxes * this.pointQuantities.foxKilled) +
						(numberOfFoxLives * this.pointQuantities.foxHit)
		
		this.totalScore += caveTotalPowerupScore

	},

	itemCollected: function (item)
	{
		if(item == "cave")
		{
			this.caves.thisLevel += 1
			this.caves.totalCollected += 1
		}
		else if(item == "farmer")
		{
			this.farmers.thisLevel += 1
			this.farmers.totalKilled += 1
		}
		else if(item == "life")
		{
			this.lives.current += 1
			this.lives.thisLevel += 1
		}
		else if(item == "child")
		{
			statsBoard.score += this.pointQuantities.child;
		}
	},

	refreshGameStats: function ()
	{
		//lives.current is equivalent to "totalCollected"
		this.lives.current = 1;
		this.carrots.totalCollected = 0;
		this.caves.totalCollected = 0;
		this.farmers.totalKilled = 0;
		this.score = 0;
		this.children.current = 0;
	},

	refreshCurrentLevel: function ()
	{
		this.carrots.thisLevelTotal = levels[currentLevel].carrotPositionsArray.length
		this.caves.thisLevelTotal = levels[currentLevel].cavesData.length
		this.farmers.thisLevelTotal = levels[currentLevel].farmerPositionsArray.length
		this.lives.thisLevelTotal = levels[currentLevel].heartPositionsArray.length
		
		this.carrots.thisLevel = 0;
		this.caves.thisLevel = 0;
		this.farmers.thisLevel = 0;
		this.lives.thisLevel = 0;									
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
		farmer: 100,
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

	farmers:
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

	carrotData:
	{
		xPos: null,
		yPos: null,
		size: null
	},

	heartData:
	{
		xPos: null,
		yPos: null,
		size: null
	},

	childrenData:
	{
		outlineColor: [0],
		lightColor: [205,160,106],
		darkColor: [200,135,82]
		
	},

	husbandData:
	{
		xPos: 150,
		yPos: 120,
		size: 0.25,
		outlineColor: [0],
		lightColor: ['#765231'],
		darkColor: [255]
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

			childBoardX = (levels[currentLevel].levelChildPosition[0] * this.boardScale.scale) + this.boardScale.x
			childBoardY = (levels[currentLevel].levelChildPosition[1] * this.boardScale.scale) + this.boardScale.y

			if(currentChild.xPos > childBoardX)
			{
				currentChild.xPos -= currentChild.xUpdate
			}
			else
			{
				currentChild.xPos += currentChild.xUpdate
			}

			if(currentChild.yPos > childBoardY)
			{
				currentChild.yPos -= currentChild.yUpdate
			}
			else
			{
				currentChild.yPos += currentChild.yUpdate
			}

			currentChild.size += currentChild.sizeUpdate
			if(currentLevel == 2)
			{
				drawRabbit(currentChild.xPos, currentChild.yPos, currentChild.size, this.husbandData.outlineColor, this.husbandData.lightColor, this.husbandData.darkColor)
			}
			else
			{
				drawRabbit(currentChild.xPos, currentChild.yPos, currentChild.size, this.childrenData.outlineColor, this.childrenData.lightColor, this.childrenData.darkColor)
			}
			currentChild.lifeSpan -= 1
			if(currentChild.lifeSpan <= 0)
			{
				this.itemCollected("child")

				this.childrenToStatsArray = [];
				if(currentLevel != 2)
				{
					currentLevel += 1;
					if(levels[currentLevel].yIdxUpdated == false)
					{
						updateYObjStart()
						levels[currentLevel].yIdxUpdated = true
					}
					startGame();
				}
				else
				{
					introOutro.isOutro = true;
				}
			}
		}
	},

	drawBoard: function (levelText, levelTextWidth, levelChildPosition)
	{
		bs = this.boardScale.scale
		bx = this.boardScale.x
		by = this.boardScale.y

		//update carrot & heart data
		this.carrotData.xPos = this.boardScale.x + (35 * this.boardScale.scale)
		this.carrotData.yPos = this.boardScale.y + (80 * this.boardScale.scale)
		this.carrotData.size =  0.2 * this.boardScale.scale

		this.heartData.xPos = this.boardScale.x + (330 * this.boardScale.scale)
		this.heartData.yPos = this.boardScale.y + (30 * this.boardScale.scale)
		this.heartData.size = 0.3 * this.boardScale.scale



		textSize(30 * bs)
		textAlign(LEFT)
		textFont(NESfont)
		noStroke()

		fill(255)
		stroke(230);
		strokeWeight(5 * bs);
		rect(bx, by, 365 * bs, 120 * bs, 15 * bs) //main board
		rect(bx + (380 * bs), by, levelTextWidth * bs, 50 * bs, 13 * bs) // side board

		noStroke();
		fill(0)
		textAlign(LEFT)
		text(levelText, bx + (398 * bs), by + (35 * bs))

		//score
		textAlign(RIGHT)
		text(this.score, bx + (185 * bs), by + (40 * bs))

		//lives
		this.drawHeart(this.heartData.xPos, this.heartData.yPos, this.heartData.size)
		text(this.lives.current, bx + (300 * bs), by + (40 * bs))

		//current level data
		currentLevelBackgroundColor = color(252, 180, 191)
		fill(currentLevelBackgroundColor);
		rect(bx + (15 * bs), by + (56 * bs), 336 * bs, 50 * bs, 10 * bs) //pink bar

		//pink bar data
		textAlign(CENTER)
		currentLevelNumberColor = color(255, 255, 255)

		fill(currentLevelNumberColor)

		//carrots data
		text(this.carrots.thisLevelTotal - this.carrots.thisLevel, bx + (87 * bs), by + (90 * bs))

		//farmers data
		text(this.farmers.thisLevelTotal - this.farmers.thisLevel, bx + (156 * bs), by + (90 * bs))
		
		//cave data
		text(this.caves.thisLevelTotal - this.caves.thisLevel, bx + (250 * bs), by + (90 * bs))

		//lives data
		text(this.lives.thisLevelTotal - this.lives.thisLevel, bx + (326 * bs), by + (90 * bs))

		//draw carrot
		this.drawCarrot(this.carrotData.xPos, this.carrotData.yPos, this.carrotData.size)

		//draw heart
		this.drawHeart(bx + (286 * bs), by + (80 * bs), 0.3 * bs)

		//draw child
		rabbitX = bx + (levelChildPosition[0] * bs)
		rabbitY = by + (levelChildPosition[1] * bs)

		if(currentLevel == 2)
		{
			drawRabbit(rabbitX, rabbitY, levelChildPosition[2] * bs, this.husbandData.outlineColor, this.husbandData.lightColor, this.husbandData.darkColor)
		}
		else
		{
			drawRabbit(rabbitX, rabbitY, levelChildPosition[2] * bs, this.childrenData.outlineColor, this.childrenData.lightColor, this.childrenData.darkColor)
		}

		//draw farmer
		farmerX = bx + (120 * bs)
		farmerY = by + (85 * bs)
		farmerSize = 0.32 * bs

		fill(farmers.farmerColors.innerFoot)
		rect(farmerX - (20 * farmerSize), farmerY + (15 * farmerSize), 12 * farmerSize, 25 * farmerSize) // inner foot
		fill(farmers.farmerColors.body)
		rect(farmerX - (20 * farmerSize), farmerY - (30 * farmerSize), 40 * farmerSize, 60 * farmerSize) // main body
		fill(farmers.farmerColors.outerFoot)
		rect(farmerX + (10 * farmerSize), farmerY + (15 * farmerSize), 15 * farmerSize, 25 * farmerSize) // outer foot

		fill(farmers.farmerColors.face)
		rect(farmerX - (14 * farmerSize), farmerY - (50 * farmerSize), 28 * farmerSize, 20 * farmerSize) // head
		fill(farmers.farmerColors.hatBottom)
		rect(farmerX - (32 * farmerSize), farmerY - (59 * farmerSize), 60 * farmerSize, 9 * farmerSize) // hat brim
		fill(farmers.farmerColors.hatTop)
		rect(farmerX - (14 * farmerSize), farmerY - (70 * farmerSize), 28 * farmerSize, 11 * farmerSize) // hat top

		fill(farmers.farmerColors.gunBottom)
		rect(farmerX - (14 * farmerSize), farmerY - (7 * farmerSize), 16 * farmerSize, 10 * farmerSize) // gun handle
		fill(farmers.farmerColors.gunTop)
		rect(farmerX - (30 * farmerSize), farmerY - (15 * farmerSize), 65 * farmerSize, 9 * farmerSize) // gun barrel

		//draw cave
		caveX = bx + (202 * bs)
		caveY = by + (98 * bs)
		caveSize = 0.115 * bs
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
			if(this.canyonsArray[i].checkCollision(rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos()) && rabbitCharacter.isDead == false && statsBoard.deathHandled == false && rabbitCharacter.jumpingData.currentlyJumping == false)
			{
				playSound("gameOver")
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
			rect(x - (100 * s), y - (99 * s), 250 * s, 100 * s)
			rect(x - (50 * s), y - (175 * s), 150 * s, 80 * s)
			rect(x, y - (195 * s), 50 * s, 25 * s)

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
			// triangle(x - (40 * s), y + (100 * s),
			// 		 x - (80 * s), y + (232 * s), 
			// 		 x, y + (232 * s))
			// triangle(x + (40 * s), y + (100 * s), 
			// 		 x, y + (232 * s), 
			// 		 x + (80 * s), y + (232 * s))
			triangle(x - (120 * s), y + (100 * s),
					 x - (190 * s), y + (232 * s), 
					 x - (50 * s), y + (232 * s))
			triangle(x + (120 * s), y + (100 * s), 
					 x + (190 * s), y + (232 * s), 
					 x + (50 * s), y + (232 * s))
			//middle mountain
			fill(this.mountainColors.middleMountain)
			triangle(x, y, 
					 x - (100 * s), y + (232 * s), 
					 x + (100 * s), y + (232 * s))
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

			//snow cap
			fill(this.mountainColors.snowCap)
			triangle(x, y,
					 x - (25 * s), y + (58 * s),
					 x + (25 * s), y + (58 * s))
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

		gameCharYInRange = abs(rabbitCharacter.getFeetPos() - (cloudY)) < 10

		onCloud = gameCharXInRange && gameCharYInRange && rabbitCharacter.jumpingData.goingUpwards == false
		if(onCloud && rabbitCharacter.isDead == false)
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
			yInRange = abs((currentCarrot.y + heightPos) - (currentCloud.yPos + heightPos)) < 60
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

		//check all farmers
		for(i = 0; i < farmers.farmersArray.length; i++)
		{
			currentfarmer = farmers.farmersArray[i]
			xInRange = (currentfarmer.xPos > currentCloud.xPos + 15 && currentfarmer.xPos < currentCloud.xPos + 175)
			yInRange = abs((currentfarmer.yPos + heightPos) - (currentCloud.yPos + heightPos)) < 60

			if(xInRange && yInRange)
			{
				if(farmers.farmersArray[i].cloudData.onCloud == false)
				{
					farmers.farmersArray[i].cloudData.onCloud = true
					farmers.farmersArray[i].cloudData.cloudIdx = cloudIdx
				}
				if(farmers.farmersArray[i].cloudData.onCloud && farmers.farmersArray[i].cloudData.cloudIdx == cloudIdx)
				{
					if(currentCloud.direction == "left")
					{
						currentfarmer.xPos -= currentCloud.speed
					}
					else if(currentCloud.direction == "right")
					{
						currentfarmer.xPos += currentCloud.speed
					}
				}
			}			
		}

		//check all powerups
		for(i = 0; i < powerups.powerupsArray.length; i++)
		{
			currentPowerup = powerups.powerupsArray[i]
			xInRange = (currentPowerup.x > currentCloud.xPos + 15 && currentPowerup.x < currentCloud.xPos + 175)
			yInRange = abs((currentPowerup.y + heightPos) - (currentCloud.yPos + heightPos)) < 40

			if(xInRange && yInRange)
			{
				if(currentCloud.direction == "left")
				{
					currentPowerup.x -= currentCloud.speed
				}
				else if (currentCloud.direction == "right")
				{
					currentPowerup.x += currentCloud.speed
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
			carrotFloorPosY: y + (s * 170),
			inProximity: function (charX, charY)
			{
				carrotX = this.x
				carrotY = this.currentYPos + (10 * this.size)

				carrotRadius = collisionBoundaryData.friendlyObject

				if(powerups.superSizeData.superSized)
				{
					carrotRadius = collisionBoundaryData.friendlyObjectSuperSize
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
			
			generatedGround.push({color: dirtDark, x: groundStart, y: yPos, width: groundEnd - groundStart, height: 500});

			yPos += 100;
			this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);
			yPos += 100;
			this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);
			yPos += 100;
			this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);


			yPos -= 250;
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
	movingLeftScroll: false,
	movingRightScroll: false,

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
		return this.yPos - (135 * this.size)
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
		onFloor = abs(this.getFeetPos() - (floorPos_y + heightPos)) < 30
		
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
		if(!powerups.superSpeedData.isActive)
		{
			this.jumpingData.defaultJumpDuration = this.jumpingData.resetJumpDuration
		}

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
			this.movingLeftScroll = false
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
				this.movingRightScroll = true;
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
			this.movingRightScroll = false
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
				this.movingLeftScroll = true;
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
			this.movingRightScroll = false
			this.movingLeftScroll = false
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

//--------------------farmers OBJECT--------------------//
farmers = 
{

	farmerColors: 
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

	createFarmer: function (xPos, yPos, scale, firingFrequency, firingSpeed, maxBulletDistLeft, maxBulletDistRight, maxBulletDistIsX, dropPowerupType)
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
			cloudData: {onCloud: false, cloudIdx: null},
			dropPowerupType: dropPowerupType,
			droppedPowerup: false,
		}
		return e
	},

	farmersArray: [],

	addFarmers: function (farmersInput)
	{
		for(newfarmerIdx = 0; newfarmerIdx < farmersInput.length; newfarmerIdx++)
		{
			farmerInput = farmersInput[newfarmerIdx]
			f = this.createFarmer(farmerInput.xPos, farmerInput.yPos, farmerInput.scale, farmerInput.firingFrequency, farmerInput.firingSpeed, farmerInput.maxBulletDistLeft, farmerInput.maxBulletDistRight, farmerInput.maxBulletDistIsX, farmerInput.dropPowerupType)
			this.farmersArray.push(f)
			f.direction = this.checkFarmerDirection(this.farmersArray.length - 1)

		}
	},

	drawFarmers: function ()
	{
		for(farmerIdx = this.farmersArray.length - 1; farmerIdx >= 0; farmerIdx --)
		{
			farmer = this.farmersArray[farmerIdx]

			//check for whether farmer has been killed
			if(this.checkDeadFarmer(farmerIdx))
			{
				playSound("jumpedOnEnemy")
				farmer.isDead = true
				statsBoard.addPoints(statsBoard.pointQuantities.farmer)
				if(farmer.dropPowerupType == "")
				{
					statsBoard.itemCollected("farmer")
				}
			}

			//draw farmer dead animation and control removing farmer from the array
			if(farmer.isDead)
			{
				farmer.yPos += 8;
				if(farmer.yPos > resizeCanvasData.currentHeight + 100)
				{
					this.farmersArray.splice(farmerIdx, 1)
				}
			}

			//create powerup if farmer dies
			if(farmer.isDead && farmer.droppedPowerup == false)
			{
				if(farmer.dropPowerupType == "size")
				{
					powerups.addPowerups([{xPos: farmer.xPos, yPos: farmer.yPos - 20, size: 0.2, type: "size", fromCave: false, fromFarmer: true}])
				}
				else if(farmer.dropPowerupType == "speed")
				{
					powerups.addPowerups([{xPos: farmer.xPos, yPos: farmer.yPos - 20, size: 0.2, type: "speed", fromCave: false, fromFarmer: true}])
				}
				else if(farmer.dropPowerupType == "flower")
				{
					powerups.addPowerups([{xPos: farmer.xPos, yPos: farmer.yPos - 20, size: 0.25, type: "flower", fromCave: false, fromFarmer: true}])
				}
				farmer.droppedPowerup = true
			}

			fill(255);

			//update farmer direction
			if(farmer.isDead == false)
			{
				farmer.direction = this.checkFarmerDirection(farmerIdx)
			}
			
			if(farmer.direction == "right")
			{
				s = farmer.scale

				//right shooter
				fill(this.farmerColors.innerFoot)
				rect(farmer.xPos - (20 * s), farmer.yPos + (15 * s), 12 * s, 25 * s) // inner foot
				fill(this.farmerColors.body)
				rect(farmer.xPos - (20 * s), farmer.yPos - (30 * s), 40 * s, 60 * s) // main body
				fill(this.farmerColors.outerFoot)
				rect(farmer.xPos + (10 * s), farmer.yPos + (15 * s), 15 * s, 25 * s) // outer foot

				fill(this.farmerColors.face)
				rect(farmer.xPos - (14 * s), farmer.yPos - (50 * s), 28 * s, 20 * s) // head
				fill(this.farmerColors.hatBottom)
				rect(farmer.xPos - (32 * s), farmer.yPos - (59 * s), 60 * s, 9 * s) // hat brim
				fill(this.farmerColors.hatTop)
				rect(farmer.xPos - (14 * s), farmer.yPos - (70 * s), 28 * s, 11 * s) // hat top

				fill(this.farmerColors.gunBottom)
				rect(farmer.xPos - (14 * s), farmer.yPos - (7 * s), 16 * s, 10 * s) // gun handle
				fill(this.farmerColors.gunTop)
				rect(farmer.xPos - (30 * s), farmer.yPos - (15 * s), 65 * s, 9 * s) // gun barrel
			}
			else if(farmer.direction == "left")
			{
				s = farmer.scale

				//left shooter
				fill(this.farmerColors.innerFoot)
				rect(farmer.xPos + (8 * s), farmer.yPos + (15 * s), 12 * s, 25 * s) // inner foot
				fill(this.farmerColors.body)
				rect(farmer.xPos - (20 * s), farmer.yPos - (30 * s), 40 * s, 60 * s) // main body
				fill(this.farmerColors.outerFoot)
				rect(farmer.xPos - (25 * s), farmer.yPos + (15 * s), 15 * s, 25 * s) // outer foot

				fill(this.farmerColors.face)
				rect(farmer.xPos - (14 * s), farmer.yPos - (50 * s), 28 * s, 20 * s) // head
				fill(this.farmerColors.hatBottom)
				rect(farmer.xPos - (28 * s), farmer.yPos - (59 * s), 60 * s, 9 * s) // hat brim
				fill(this.farmerColors.hatTop)
				rect(farmer.xPos - (14 * s), farmer.yPos - (70 * s), 28 * s, 11 * s) // hat top

				fill(this.farmerColors.gunBottom)
				rect(farmer.xPos - (2 * s), farmer.yPos - (7 * s), 16 * s, 10 * s) // gun handle
				fill(this.farmerColors.gunTop)
				rect(farmer.xPos - (35 * s), farmer.yPos - (15 * s), 65 * s, 9 * s) // gun barrel
	
			}

			//shoot bullets
			if(frameCount % farmer.firingFrequency == 0 && farmer.isDead == false)
			{
				if(farmer.maxBulletDistIsX)
				{
					this.bullets.addBullet(farmer.xPos, farmer.yPos - 10, farmer.scale, farmer.direction, farmer.firingSpeed, farmer.maxBulletDistLeft, farmer.maxBulletDistRight)
				}
				else
				{
					this.bullets.addBullet(farmer.xPos, farmer.yPos - 10, farmer.scale, farmer.direction, farmer.firingSpeed, farmer.xPos - farmer.maxBulletDistLeft, farmer.xPos + farmer.maxBulletDistRight)
				}
			}
		}
	},

	checkDeadFarmer: function (farmerIdx)
	{
		farmerInRange = dist(this.farmersArray[farmerIdx].xPos, this.farmersArray[farmerIdx].yPos - 60, rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos() - heightPos) < 25

		if(farmerInRange && rabbitCharacter.jumpingData.goingUpwards == false)
		{
			rabbitCharacter.earRotationData.currentlyRotating = true;
			rabbitCharacter.jumpingData.goingUpwards = true;
			rabbitCharacter.earRotationData.customRotationValue = rabbitCharacter.jumpingData.defaultJumpDuration * 0.75
			rabbitCharacter.jumpingData.jumpingDuration = round(rabbitCharacter.jumpingData.defaultJumpDuration * 0.75)
			rabbitCharacter.userInput.airCondition = "jumping"
			return true
		}
		return false
	},

	checkFarmerDirection: function (farmerIdx)
	{
		if(rabbitCharacter.realWorldPos < this.farmersArray[farmerIdx].xPos)
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
				bulletInContactRadius = collisionBoundaryData.bulletSuperSize
			}
			else
			{
				bulletInContactRadius = collisionBoundaryData.bullet
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
						playSound("gameOver")
						powerups.deactivatePowerups("both")
						rabbitCharacter.isDead = true;
					}
					this.bulletsArray.splice(bulletIdx, 1) 
				}				

				//update bullet position
				if(bullet.direction == "right")
				{
					bullet.xPos += bullet.speed
					fill(farmers.farmerColors.bulletColor)
					ellipse(bullet.xPos, bullet.yPos, 12 * bullet.scale, 12 * bullet.scale) // bullet round
					rect(bullet.xPos - 13, bullet.yPos - (6 * bullet.scale), 12 * bullet.scale, 12 * bullet.scale) // bullet rect 

				}
				else if(bullet.direction == "left")
				{
					bullet.xPos -= bullet.speed
					fill(farmers.farmerColors.bulletColor)
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

//--------------------BIRDS OBJECT--------------------//
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
		birdLight: null,
		birdDark: null,
		birdBeak: null
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

		speedDifference = 0
		if(currentCluster.direction == "right")
		{
			
			if(rabbitCharacter.movingRightScroll)
			{
				speedDifference = -1 * rabbitCharacter.rabbitSpeedData.defaultSpeed
			}
			else if (rabbitCharacter.movingLeftScroll)
			{
				speedDifference = rabbitCharacter.rabbitSpeedData.defaultSpeed
			}
			currentCluster.xPos += this.settings.clusterSpeed + speedDifference
			
		}
		else if(currentCluster.direction == "left")
		{
			if(rabbitCharacter.movingLeftScroll)
			{
				speedDifference = -1 * rabbitCharacter.rabbitSpeedData.defaultSpeed
			}
			else if (rabbitCharacter.movingRightScroll)
			{
				speedDifference = rabbitCharacter.rabbitSpeedData.defaultSpeed
			}
			currentCluster.xPos -= this.settings.clusterSpeed + speedDifference
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
			if(currentCluster.xPos < (this.settings.startingLeft) && currentCluster.direction == "left")
			{
				currentCluster.cooldown -= 1
			}

			if(currentCluster.xPos > (this.settings.startingRight) && currentCluster.direction == "right")
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

	if(introOutro.isIntro.display)
	{
		if(!introOutro.isIntro.starting)
		{
			introOutro.startKidnappers()
		}
		if(!introSongSound.isPlaying()){introSongSound.loop()}

		introOutro.isIntro.starting = true;
	}

	if(introOutro.isIntro.display || introOutro.isOutro) {return}

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
		//starts game sound
		if(gameLoopSound.isPlaying() == false)
		{
			if(!purpleCarrotCollectedSound.isPlaying()){gameLoopSound.loop()}
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
		if (keyCode == 32 && rabbitCharacter.userInput.airCondition == "walking" && rabbitCharacter.isDead == false)
		{
			playSound("jump")
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

//--------------------DRAW RABBIT HELPER FUNCTION--------------------//
function drawRabbit(x, y, s, outlineColor, lightColor, darkColor)
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
		playSound("gameOver")
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
		startGame()
		statsBoard.refreshGameStats()
	}
	if(gameOver.onShareButton(mouseX, mouseY) && gameOver.drawMessageBool == true)
	{
		saveCanvas('myScore', 'png')
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
	else if(event == "familyCollected")
	{
		familyCollectedSound.play()
	}
	else if(event == "flowerCollected")
	{
		flowerCollectedSound.play()
	}
	else if(event == "gameOver" && rabbitCharacter.isDead == false)
	{
		gameOverSound.play()
	}
	else if(event == "jump")
	{
		jumpSound.play()
	}
	else if(event == "jumpedOnEnemy")
	{
		jumpedOnEnemySound.play()
	}
	else if(event == "superSpeedCollected")
	{
		superSpeedCollectedSound.play()	
	}
}
