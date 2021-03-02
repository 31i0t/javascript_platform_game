//global vars
var floorPos_y;

function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	startGame();
	drawGround.generateLayeredGround(color(19,232,83),
								color(12,86,25),
								color(77,50,32),
								color(55,34,25),
								color(35,21,14),
								color(13,9,6),
								floorPos_y,
								0,
								width);
	// drawGround.drawCurrentGround(currentGround)
}

function startGame()
{
	carrots.setCarrotColors(color(246, 118, 34), color(35, 92, 70),)
	carrots.addCarrots([{xPos: 100, yPos: 400, size: 0.5}, {xPos: 850, yPos: 400, size: 0.5}])
}

function draw()
{
	fill(255);
	// rect(0,0,width,(height/4) * 3);
	collectedAnimations.animateAnimations()
	rabbitCharacter.drawRabbit()
	carrots.drawCarrots();
	
}

//objects

//--------------------CARROT OBJECT--------------------//
carrots = 
{
	carrotScore: 0,
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
			inProximity: function (charX, charY)
			{
				carrotX = this.x + (50 * this.size)
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
			this.carrotArray.push(this.carrot(carrotsInput[i].xPos, carrotsInput[i].yPos, carrotsInput[i].size))
		}
	},

	drawCarrots: function()
	{
		for(i = this.carrotArray.length - 1; i >= 0; i--)
		{
			//check if player is close to this carrot
			if(this.carrotArray[i].inProximity(rabbitCharacter.xPos, rabbitCharacter.getCenterPos()))
			{
				if(!this.carrotArray[i].beenCollected)
				{
					collectedAnimations.addAnimation(this.carrotArray[i].x, rabbitCharacter.getFeetPos(), color(255, 215, 0), color(218, 165, 32))
				}
				
				this.carrotArray[i].beenCollected = true;
			}

			//animate carrots if they haven't been collected
			if(this.carrotArray[i].downAnimation && !this.carrotArray[i].beenCollected)
			{
				if(this.carrotArray[i].currentYPos - this.carrotArray[i].y == 10)
				{
					this.carrotArray[i].downAnimation = false;
				}
				this.carrotArray[i].currentYPos++;
			}
			else if (!this.carrotArray[i].downAnimation && !this.carrotArray[i].beenCollected)
			{
				if(this.carrotArray[i].y - this.carrotArray[i].currentYPos == 10)
				{
					this.carrotArray[i].downAnimation = true;
				}
				this.carrotArray[i].currentYPos--;
			} 

			//animate the carrots once they are collected
			if(this.carrotArray[i].beenCollected)
			{
				if(this.carrotArray[i].currentSize * 1.1 > this.carrotArray[i].size)
				{
					this.carrotArray[i].size *= 1.001;
				}
				else
				{
					this.carrotScore += 1;
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
		}
	}
}

//--------------------DRAW GROUND--------------------//
var drawGround = 
{
	drawRow: function(lightColor, darkColor, groundStart,groundEnd, yPos)
	{
		noStroke();

		while(groundStart < groundEnd)
		{
			xRandom = 15
			yRandom = 10
			widthRandom = [15, 20]
			heightRandom = [15, 20]
			density = 10
			//draw the grass
			if(random(0, 1) < 0.5)
			{
				fill(lightColor);
				rect(groundStart + random(-xRandom, xRandom), yPos + random(-yRandom, yRandom), random(widthRandom[0], widthRandom[1]), random(heightRandom[0], heightRandom[1]));
			}
			else
			{
				fill(darkColor);
				rect(groundStart + random(-xRandom, xRandom), yPos + random(-yRandom, yRandom), random(widthRandom[0], widthRandom[1]), random(heightRandom[0], heightRandom[1]));
			}
			groundStart += density;
		}
	},

	generateLayeredGround: function (grassLight, grassDark, dirtLight, dirtDark, bedRockLight, bedRockDark, yPos, groundStart, groundEnd)
	{
		fill(dirtDark);
		rect(groundStart, yPos, groundEnd, 500);
		yPos += 100;
		for(i = 0; i < 4; i++)
		{
			this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos + (i * 10));
		}
		yPos -= 55;
		for(i = 0; i < 5; i++)
		{
			this.drawRow(dirtLight, dirtDark, groundStart, groundEnd, yPos + (i * 10));
		}
		yPos -= 50;
		for(i = 0; i < 5; i++)
		{
			this.drawRow(color(grassLight), color(grassDark), groundStart, groundEnd, yPos + (i * 10));
		}
	}
}

//--------------------CHARACTER OBJECT--------------------//
var rabbitCharacter = 
{
	xPos: 512,
	yPos: 217, 
	size: 1,
	getFeetPos: function ()
	{
		return this.yPos + (215 * this.size)
	},
	getCenterPos: function ()
	{
		return this.yPos + (170 * this.size)
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

	drawRabbit: function()
	{
		s = this.size
		x = this.xPos
		y = this.yPos

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
				this.yPos -= this.jumpingData.currentSpeed
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
			else
			{
				this.yPos += this.jumpingData.currentSpeed
				if(this.jumpingData.jumpingDuration == 0)
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
			this.xPos += 4;
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
			this.xPos -= 5;
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
				// //back legs
				// rect(x - (20 * s), y + (215 * s), 15 * s, 15 * s); // front left leg
				// rect(x + (10 * s), y + (215 * s), 15 * s, 15 * s); // front right leg

				//main body
				rect(x - (22.5 * s), y + (150 * s), 45 * s, 70 * s); //body
				rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head
				rect(x - (15 * s), y + (140 * s), 2 * s, 20 * s); //left eye
				rect(x + (15 * s), y + (140 * s), 2 * s, 20 * s); //right eye

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

//--------------------UPDATE PLAYER INPUT FUNCTION--------------------//

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
		rabbitCharacter.earRotationData.currentlyRotating = true;
        rabbitCharacter.jumpingData.currentlyJumping = true;
		rabbitCharacter.userInput.airCondition = "jumping"
    }
}
