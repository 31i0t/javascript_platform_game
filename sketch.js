//global vars
var floorPos_y;
var currentGround;
var scrollPos;
var heightPos;

function setup()
{
	frameRate(60)
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	startGame();
}

function startGame()
{
	scrollPos = 0;
	heightPos = 0;
	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;
	carrots.setCarrotColors(color(246, 118, 34), color(35, 92, 70),)
	carrotsArray = [{xPos: 300, yPos: 380, size: 0.2}, {xPos: 850, yPos: 380, size: 0.2}]
	carrots.addCarrots(carrotsArray)
	statsBoard.carrots.thisLevelTotal = carrotsArray.length
	lives.color = color(255, 0, 0)
	heartsArray = [{xPos: 250, yPos: 380, size: 0.3}, {xPos: 20, yPos: 380, size: 0.3}]
	lives.addHearts(heartsArray)
	currentGround = drawTerrain.generateLayeredGround(color(19,232,83),
								color(12,86,25),
								color(77,50,32),
								color(55,34,25),
								color(35,21,14),
								color(13,9,6),
								floorPos_y,
								0,
								width);
	platformsData = [{yPos: 100, platformStart: 200, platformEnd: 500},
					{yPos: 300, platformStart: 100, platformEnd: 200}]
	currentPlatforms = drawTerrain.generateLayeredPlatforms(color(19,232,83),
								color(12,86,25),
								color(77,50,32),
								color(55,34,25),
								color(35,21,14),
								color(13,9,6),
								platformsData)
	clouds.addClouds([{xPos: width/2, yPos: 200, direction: "left"},
					{xPos: 100, yPos: 0, direction: "right"},
					{xPos: 100, yPos: -200, direction: "left"},
					{xPos: 100, yPos: -400, direction: "right"}])
	mountains.mountainColors = {sideMountains: color(126,116,116), middleMountain: color(196,182,182), river: color(31,111,139), snowCap: color(255,255,255)}
	mountains.mountainIndcies = [{xPos: width/2, yPos: 200, scale: 1}]
	trees.treeColors = {leaves: color(0, 155, 0), trunk: color(120, 100, 40)}
	trees.treeIndcies = [20, 200, 500]
	canyons.addCanyons([{xPos: 400, canyonWidth: 100}, {xPos: 600, canyonWidth: 100}])
	canyons.color = color(100, 155, 255)
	enemies.enemyColors = {hatTop: color(153, 76, 0),
		hatBottom: color(102, 51, 0),
		gunTop: color(128),
		gunBottom: color(96),
		innerFoot: color(139,69,19),
		outerFoot: color(160,82,45),
		body: color(0, 77, 0),
		face: color(191, 153, 115),
		bulletColor: color(69)}
	enemiesArray = [{xPos: 900, yPos: 392, scale: 1, firingFrequency: 100, firingSpeed: 30, maxBulletDistLeft: 100, maxBulletDistRight: 700},
					{xPos: 420, yPos: 60, scale: 1, firingFrequency: 20, firingSpeed: 10, maxBulletDistLeft: 100, maxBulletDistRight: 700}]
	enemies.addEnemies(enemiesArray)
	statsBoard.enemies.thisLevelTotal = enemiesArray.length
	
}

function draw()
{

	console.log(floorPos_y - 200)

	logFrameRate(50, 80)
	
	background(100, 155, 255);

	push();
    translate(scrollPos, heightPos);
	mountains.drawMountains()
	trees.drawTrees()
	collectedAnimations.animateAnimations()
	drawTerrain.drawCurrentTerrain(currentGround, currentPlatforms)
	canyons.drawCanyons();
	clouds.drawClouds();
	enemies.bullets.updateExpiredBullets()
	enemies.bullets.drawBullets()
	enemies.drawEnemies()
	pop();

	rabbitCharacter.drawRabbit()
	rabbitCharacter.realWorldPos = rabbitCharacter.xPos - scrollPos;

	//draw collectables in front of character
	push();
    translate(scrollPos, heightPos);
	carrots.drawCarrots();
	lives.drawHearts();
	pop();

	statsBoard.drawBoard()
	statsBoard.drawCarrotsToStats()
	statsBoard.drawHeartsToStats()
	
}

//objects


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
			currentSize: s,
			downAnimation: true,
			beenCollected: false,
			heartFloorPosY: y + (s * 150),
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
					collectedAnimations.addAnimation(this.heartsArray[i].x, this.heartsArray[i].heartFloorPosY, color(196, 58, 30), color(150, 24, 0))

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
				if(this.heartsArray[i].currentSize * 2 > this.heartsArray[i].size)
				{
					this.heartsArray[i].size *= 1.0075;
				}
				else
				{
					h = this.heartsArray[i]
					statsBoard.heartsToStatsArray.push({xPos: h.x + scrollPos, yPos: h.y, size: h.size, lifeSpan: 100,
						xUpdate: abs(h.x - (statsBoard.heartData.xPos - scrollPos)) / 100, yUpdate: abs(h.y - statsBoard.heartData.yPos) / 100, sizeUpdate: (statsBoard.heartData.size - h.size) / 100})
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

	lives:
	{
		current: 3,
		total: 5
	},

	enemies:
	{
		thisLevel: 0,
		thisLevelTotal: 0,
		total: 0
	},

	carrots:
	{
		thisLevel: 0,
		thisLevelTotal: 0,
		total: 0
	},

	carrotData:
	{
		xPos: 42,
		yPos: 70,
		size: 0.11
	},

	heartData:
	{
		xPos: 130,
		yPos: 43,
		size: 0.2
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
				statsBoard.score += 50;
				statsBoard.carrots.thisLevel += 1;
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
				statsBoard.score += 50;
				statsBoard.lives.current += 1;
				this.heartsToStatsArray.splice(i, 1)
			}
		}
	},

	drawBoard: function ()
	{
		textSize(20)
		textStyle(BOLD)
		textFont('serif')
		noStroke()

		fill(255)
		rect(20, 20, 200, 80, 15) //main board

		fill(0)
		text(this.score, 35, 50) // score
		fill(120)
		textStyle(NORMAL)
		text(this.carrots.thisLevel + " / " + this.carrots.thisLevelTotal, 60, 78)
		text(this.enemies.thisLevel + " / " + this.enemies.thisLevelTotal, 150, 78)
		text(this.lives.current + " / " + this.lives.total, 150, 51)





		// DRAW CARROT SYMBOL
		this.drawCarrot(this.carrotData.xPos, this.carrotData.yPos, this.carrotData.size)
		// DRAW LIVES SYMBOL
		this.drawHeart(this.heartData.xPos, this.heartData.yPos, this.heartData.size)

		//DRAW ENEMY SYMBOL
		x = 130
		y = 74
		s = 0.2
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
			if(this.canyonsArray[i].checkCollision(rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos()) && rabbitCharacter.isDead == false)
			{
				rabbitCharacter.isDead = true;
				statsBoard.lives.current -= 1
			}
			fill(this.color);
			rect(this.canyonsArray[i].x, floorPos_y, this.canyonsArray[i].canyonWidth, 400)
		}
	}
}

//--------------------TREES OBJECT--------------------//
trees = 
{
	treeIndcies: [],

	treeColors: 
	{
		leaves: null,
		trunk: null,
	},

	drawTrees: function ()
	{
		noStroke();
		for (var i = 0; i < this.treeIndcies.length; i++)
    	{
			x = this.treeIndcies[i]
			fill(this.treeColors.trunk)
			rect(x, height/2, 60, 150)
			
			fill(this.treeColors.leaves)
			triangle(x - 50, height/2 + 50, 
					x + 30, height/2 - 50, 
					x + 110, height/2 + 50)
			triangle(x - 50, height/2, 
					x + 30, height/2 - 100, 
					x + 110, height/2)
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
		}
	}
}

//--------------------CLOUDS OBJECT--------------------//
clouds = 
{
	maxLeft: 100,
	maxRight: 700,

	updateCloudRiders: function (cloudIdx)
	{
		gameCharXInRange = (rabbitCharacter.realWorldPos > this.cloudsArray[cloudIdx].xPos + 15 &&
							rabbitCharacter.realWorldPos < this.cloudsArray[cloudIdx].xPos + 175);

		gameCharYInRange = abs(rabbitCharacter.getFeetPos() - (this.cloudsArray[cloudIdx].yPos + heightPos + 60)) < 5

		onCloud = gameCharXInRange && gameCharYInRange && rabbitCharacter.jumpingData.goingUpwards == false
		if(onCloud)
		{
			rabbitCharacter.ridingCloudData.onCloud = true;
			rabbitCharacter.onFloor = true;
			rabbitCharacter.ridingCloudData.cloudRiding = cloudIdx;
		}
	},

	createCloud: function (xPos, yPos, direction)
	{
		c = 
		{
			xPos: xPos,
			yPos: yPos,
			direction: direction,
			speed: random(1, 4),
			realPos: xPos,
			squares: null
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
			cloud = this.createCloud(currentInput.xPos, currentInput.yPos, currentInput.direction, cloudIdx)
			this.cloudsArray.push(cloud)
			cloud.squares = this.generateCloudSquares(this.cloudsArray.length - 1)
		}
	},

	drawClouds: function ()
	{
		for(cloudIdx = 0; cloudIdx < this.cloudsArray.length; cloudIdx++)
		{
			this.updateCloudRiders(cloudIdx)

			//handle randomized clouds
			if(frameCount % 60 == 0)
			{
				cloudSquares = this.generateCloudSquares(cloudIdx)
				this.cloudsArray[cloudIdx].squares = cloudSquares
			}

			//handle cloud animation
			currentCloudX = this.cloudsArray[cloudIdx].realPos
			if(this.cloudsArray[cloudIdx].direction == "left")
			{
				if(currentCloudX < this.maxLeft)
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
				if(currentCloudX > this.maxRight)
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
				// updatedXPos = map(currentRect.x,  this.maxLeft, this.maxRight)
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
			currentSize: s,
			downAnimation: true,
			beenCollected: false,
			carrotFloorPosY: y + (s * 150),
			inProximity: function (charX, charY)
			{
				carrotX = this.x
				carrotY = this.currentYPos + (10 * this.size)
				carrotRadius = this.size * 180
				return dist(carrotX, carrotY, charX, charY) < carrotRadius / 2

			}
		}
		return c
	},

	carrotArray: [],

	addCarrots: function (carrotsInput)
	{
		for(i = 0; i < carrotsInput.length; i++)
		{
			this.carrotArray.push(this.carrot(carrotsInput[i].xPos, carrotsInput[i].yPos + 20, carrotsInput[i].size))
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
					collectedAnimations.addAnimation(this.carrotArray[i].x, this.carrotArray[i].carrotFloorPosY, color(255, 215, 0), color(218, 165, 32))

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
				if(this.carrotArray[i].currentSize * 2 > this.carrotArray[i].size)
				{
					this.carrotArray[i].size *= 1.0075;
				}
				else
				{
					c = this.carrotArray[i]
					statsBoard.carrotsToStatsArray.push({xPos: c.x + scrollPos, yPos: c.y, size: c.size, lifeSpan: 100,
														xUpdate: abs(c.x - (statsBoard.carrotData.xPos - scrollPos)) / 100, yUpdate: abs(c.y - statsBoard.carrotData.yPos) / 100, sizeUpdate: (statsBoard.carrotData.size - c.size) / 100})
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

			//draw the grass
			if(random(0, 1) < 0.5)
			{
				generatedTerrain.push({color: lightColor, 
									x: groundStart + random(-xRandom, xRandom), 
									y: constrain(yPos + random(-yRandom, yRandom), maxHeight, height), 
									width: random(widthRandom[0], widthRandom[1]), 
									height: random(heightRandom[0], heightRandom[1])})
			}
			else
			{
				generatedTerrain.push({color: darkColor, 
									x: groundStart + random(-xRandom, xRandom), 
									y: constrain(yPos + random(-yRandom, yRandom), maxHeight, height), 
									width: random(widthRandom[0], widthRandom[1]),
									height: random(heightRandom[0], heightRandom[1])})
			}
			groundStart += density;
		}
	},

	generateLayeredGround: function (grassLight, grassDark, dirtLight, dirtDark, bedRockLight, bedRockDark, yPos, groundStart, groundEnd)
	{
		maxHeight = yPos
		generatedGround = [{color: dirtDark, x: groundStart, y: yPos, width: groundEnd - groundStart, height: 500}];

		yPos += 100;
		this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);

		yPos -= 55;
		this.drawRow(dirtLight, dirtDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);

		yPos -= 50;
		this.drawRow(color(grassLight), grassDark, groundStart, groundEnd, yPos, generatedGround, maxHeight, 80);

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
		this.updateCharOnPlatform()

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

	updateCharOnPlatform: function ()
	{
		for(platformIdx = 0; platformIdx < this.currentPlatforms.length; platformIdx++)
		{
			gameCharXInRange = (rabbitCharacter.realWorldPos > this.currentPlatforms[platformIdx].platformStart &&
								rabbitCharacter.realWorldPos < this.currentPlatforms[platformIdx].platformEnd);

			gameCharYInRange = abs(rabbitCharacter.getFeetPos() - (this.currentPlatforms[platformIdx].yPos + heightPos) + 4) < 10

			onPlatform = gameCharXInRange && gameCharYInRange && rabbitCharacter.jumpingData.goingUpwards == false
			if(onPlatform)
			{
				rabbitCharacter.platformData.onPlatform = true;
				rabbitCharacter.onFloor = true;
				rabbitCharacter.platformData.currentPlatformData = platformIdx;
			}
		}
	},


}

//--------------------CHARACTER OBJECT--------------------//
rabbitCharacter = 
{
	realWorldPos: 0,
	xPos: 512,
	yPos: 320, 
	size: 0.5,
	onFloor: true,
	isDead: false,

	getFeetPos: function ()
	{
		return this.yPos + (215 * this.size)
	},
	getCenterPos: function ()
	{
		return this.yPos + (150 * this.size)
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

	checkOnSurface: function ()
	{
		floorPos = 320 + heightPos
		onFloor = abs(this.yPos - floorPos) < 8
		if(onFloor && this.isDead == false)
		{
			rabbitCharacter.onFloor = true;
			rabbitCharacter.yPos = floorPos;
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

		//check if rabbit is dead and draw rabbit accordingly
		if(this.isDead)
		{
			this.onFloor = false;
			this.isDead = true;
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
					this.xPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed / 2
					scrollPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed / 2
				}
			}
			else if(clouds.cloudsArray[this.ridingCloudData.cloudRiding].direction == "left")
			{
				if(this.userInput.direction == "front")
				{
					this.xPos -= clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed / 2
					scrollPos += clouds.cloudsArray[this.ridingCloudData.cloudRiding].speed / 2
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
				if(this.getCenterPos() < 200)
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
				if(this.getCenterPos() > 379)
				{
					heightPos -= this.jumpingData.currentSpeed
				}
				else
				{
					this.yPos += this.jumpingData.currentSpeed
				}
				this.checkOnSurface()
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
			if(this.xPos < width * 0.8)
			{
				this.xPos += 4;
			}
			else
			{
				scrollPos -= 4;
			}
			stroke(0); //black outline color
			strokeWeight(5 * s); //black outline width
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
				rect(x - (42 * s), y + (153 * s), 85 * s, 55 * s); //body white inner circle (covers black outline of legs)
			}
			else if(this.userInput.airCondition == "jumping")
			{
				// rect(x - (35 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x - (45 * s), y + (190 * s), 15 * s, 15 * s);
				// rect(x + (30 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x + (20 * s), y + (190 * s), 15 * s, 15 * s);
			}
			
			stroke(0);
			strokeWeight(5 * s);

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
			ellipse(this.xPos, this.getCenterPos(), 20, 20);
		}
		else if(this.userInput.direction == "left")
		{
			if(this.xPos > width * 0.2)
			{
				this.xPos -= 4;
			}
			else
			{
				scrollPos += 4;
			}
			stroke(0); //black outline color
			strokeWeight(5 * s); //black outline width
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
				rect(x - (42 * s), y + (153 * s), 85 * s, 55 * s); //body white inner circle (covers black outline of legs)
			}
			else if(this.userInput.airCondition == "jumping")
			{
				// rect(x - (35 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x - (45 * s), y + (190 * s), 15 * s, 15 * s);
				// rect(x + (30 * s), y + (190 * s), 15 * s, 15 * s);
				rect(x + (20 * s), y + (190 * s), 15 * s, 15 * s);
			}
			stroke(0);
			strokeWeight(5 * s);

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
			ellipse(this.xPos, this.getCenterPos(), 20, 20);
		}
		else if(this.userInput.direction == "front")
		{
			stroke(0); //black outline color
			strokeWeight(5 * s); //black outline width
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
			ellipse(this.xPos, this.getCenterPos(), 20, 20);
		}
	}
};

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

	createEnemy: function (xPos, yPos, scale, firingFrequency, firingSpeed, maxBulletDistLeft, maxBulletDistRight)
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
			maxBulletDistRight: maxBulletDistRight
		}
		return e
	},

	enemiesArray: [],

	addEnemies: function (enemiesInput)
	{
		for(newEnemyIdx = 0; newEnemyIdx < enemiesInput.length; newEnemyIdx++)
		{
			enemyInput = enemiesInput[newEnemyIdx]
			e = this.createEnemy(enemyInput.xPos, enemyInput.yPos, enemyInput.scale, enemyInput.firingFrequency, enemyInput.firingSpeed, enemyInput.maxBulletDistLeft, enemyInput.maxBulletDistRight)
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
			}

			//draw enemy dead animation and control removing enemy from the array
			if(enemy.isDead)
			{
				enemy.yPos += 3;
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
				this.bullets.addBullet(enemy.xPos, enemy.yPos - 10, enemy.scale, enemy.direction, enemy.firingSpeed, enemy.maxBulletDistLeft, enemy.maxBulletDistRight)
			}
		}
	},

	checkDeadEnemy: function (enemyIdx)
	{
		fill(255, 0, 0)

		enemyInRange = dist(this.enemiesArray[enemyIdx].xPos, this.enemiesArray[enemyIdx].yPos - 60, rabbitCharacter.realWorldPos, rabbitCharacter.getFeetPos() - heightPos) < 20

		if(enemyInRange && rabbitCharacter.jumpingData.goingUpwards == false)
		{
			rabbitCharacter.earRotationData.currentlyRotating = true;
			rabbitCharacter.jumpingData.goingUpwards = true;
			rabbitCharacter.jumpingData.jumpingDuration = 100
			rabbitCharacter.userInput.airCondition = "jumping"

			//update scoreboard
			statsBoard.score += 100
			statsBoard.enemies.thisLevel += 1;

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
			if(dist(bulletX, bulletY, rabbitCharacter.realWorldPos, rabbitCharacter.getCenterPos() - heightPos) < 40)
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
					statsBoard.lives.current -= 1
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

	addAnimation: function(xPos, yPos, rectOneColor, rectTwoColor)
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
			lifeTime: 92
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



function keyPressed(){
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
    //space bar
    else if (keyCode == 32 && rabbitCharacter.userInput.airCondition == "walking")
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
	