//global vars
var floorPos_y;

// var levels:
// {
// 	one:
// 	{

// 	},
// 	two:
// 	{

// 	},
// 	three:
// 	{

// 	},
// 	four:
// 	{

// 	},
// 	five:
// 	{

// 	},
// 	size:
// 	{

// 	},
// 	seven:
// 	{

// 	},
// 	eight:
// 	{

// 	},
// 	nine:
// 	{

// 	},
// 	ten:
// 	{

// 	}
// }

//objects

//--------------------DRAW GROUND--------------------//
var drawGround = 
{
	drawRow: function(lightColor, darkColor, groundStart,groundEnd, yPos)
	{
		noStroke();
		fill(222,184,135);
		rect(groundStart, yPos, groundEnd, 500)

		while(groundStart < groundEnd)
		{
			//draw the grass
			if(random(0, 1) < 0.5)
			{
				fill(lightColor);
				rect(groundStart + random(-2, 2), yPos + random(-2, 2), 5, 5);
			}
			else
			{
				fill(darkColor);
				rect(groundStart + random(-3, 2), yPos + random(-2, 2), 5, 5);
			}
			groundStart += 1;
		}
	},

	drawLayeredGround: function (grassLight, grassDark, dirtLight, dirtDark, bedRockLight, bedRockDark, yPos, groundStart, groundEnd)
	{
		for(i = 0; i < 5; i++)
		{
			this.drawRow(color(grassLight), color(grassDark), groundStart, groundEnd, yPos + (i * 2));
		}
		yPos += 15;
		for(i = 0; i < 100; i++)
		{
			this.drawRow(dirtLight, dirtDark, groundStart, groundEnd, yPos + (i * 5));
		}
		yPos += 30;
		for(i = 0; i < 90; i++)
		{
			this.drawRow(bedRockLight, bedRockDark, groundStart, groundEnd, yPos + (i * 5));
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
		return this.yPos + (215 * s)
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

	drawRabbit: function()
	{
		s = this.size
		x = this.xPos
		y = this.yPos

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
					this.earRotationData.currentRotationValue += 10;
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
					this.earRotationData.currentRotationValue -= 5;
				}
			}
		}

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
			ellipse(this.xPos, this.getFeetPos(), 20, 20);
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
			ellipse(this.xPos, this.getFeetPos(), 20, 20);
		}
		else if(this.userInput.direction == "front")
		{
			stroke(0); //black outline color
			strokeWeight(5 * s); //black outline width
			fill(255); // white color

			//legs
			rect(x - (35 * s), y + (200 * s), 15 * s, 20 * s); // front left leg
			rect(x + (25 * s), y + (190 * s), 15 * s, 30 * s); // front right leg
			rect(x + (2 * s), y + (195 * s), 0 * s, 25 * s); // leg in middle
			rect(x + (33 * s), y + (188 * s), 15 * s, 15 * s); //tail

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

			//main body
			rect(x - (20 * s), y + (150 * s), 45 * s, 70 * s); //body
			rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head
			rect(x - (15 * s), y + (140 * s), 2 * s, 20 * s); //left eye
			rect(x + (15 * s), y + (140 * s), 2 * s, 20 * s); //right eye

			//pink elements
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(x + (1 * s), y + (169 * s), 1 * s, 1 * s); //mouth
			fill(255, 0, 0);
			ellipse(this.xPos, this.getFeetPos(), 20, 20);
		}
	},
	updateAirCondition: function()
	{
		onFeet = this.getFeetPos() == floorPos_y;

		console.log(this.getFeetPos())
		console.log(floorPos_y)
		if(onFeet)
    	{
			this.userInput.airCondition = "walking";
    	} 
		if(!onFeet)
		{
			this.yPos += 2;
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
			lifeTime: 20
		};
		this.activeAnimations.push(animation);
	},

	animateAnimations: function ()
	{
		noStroke();
		for(i = this.activeAnimations.length - 1; i >= 0; i--)
		{
			animation = this.activeAnimations[i];
			animation.rectOneHeight += 30;
			animation.rectOneWidth += 2;
			if(animation.rectOneHeight > 200)
			{
				animation.rectTwoHeight = animation.rectOneHeight;
				animation.rectTwoWidth += 15;
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
        rabbitCharacter.yPos -= 100;
		rabbitCharacter.userInput.airCondition = "jumping"
    }
}


function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	startGame();
}

function startGame()
{
	drawGround.drawLayeredGround(color(19,232,83),
								color(12,86,25),
								color(77,50,32),
								color(55,34,25),
								color(35,21,14),
								color(13,9,6),
								floorPos_y,
								-1000,
								1000)
}

function draw()
{
	background(255);
	collectedAnimations.animateAnimations()
	rabbitCharacter.drawRabbit()
	rabbitCharacter.updateAirCondition()
	
}

function mouseClicked()
{
	collectedAnimations.addAnimation(mouseX, mouseY, color(255, 215, 0), color(218, 165, 32))
}