//global vars
var floorPos_y;

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
	yPos: 200,
	feetPos: null,
	size: 1,
	floorPos: null,
	userInput: {direction: "front", airCondition: "walking"},
	legData: 
	{
		//initialize character data used to control walking animation
		rightFootForward: true,
		backLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null,  innerLegHeight: null},
		frontLegs: {outerLegPos: null, innerLegPos: null, outerLegHeight: null, innerLegHeight: null}
	},
	
	drawRabbit: function()
	{
		s = this.size
		x = this.xPos
		y = this.yPos

		if(this.legData.rightFootForward == true && frameCount % 50 == 0)
			{
				this.legData.backLegs.outerLegHeight = 28 * s;
				this.legData.backLegs.innerLegHeight = 34 * s;
				this.legData.frontLegs.outerLegHeight = 34 * s;
				this.legData.frontLegs.innerLegHeight = 28 * s;
				this.legData.rightFootForward = false;
			}
			else if(this.legData.rightFootForward == false && frameCount % 50 == 0)
			{
				this.legData.backLegs.outerLegHeight = 34 * s;
				this.legData.backLegs.innerLegHeight = 28 * s;
				this.legData.frontLegs.outerLegHeight = 28 * s;
				this.legData.frontLegs.innerLegHeight = 34 * s;
				this.legData.rightFootForward = true;
			}

		if(this.userInput.direction == "right")
			{	
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
			//main body part 2/2
			rect(x, y + (120 * s), 70 * s, 60 * s); //head
			rect(x + (10 * s), y + (80 * s), 20 * s, 40 * s); //left ear
			rect(x + (45 * s), y + (80 * s), 20 * s, 40 * s); //right ear
			rect(x + (30 * s), y + (140 * s), 2 * s, 20 * s); //left eye
			rect(x + (55 * s), y + (140 * s), 2 * s, 20 * s); //right eye

			//pink elements
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(x + (20 * s), y + (95 * s), 5 * s, 20 * s); //left inner ear
			rect(x + (55 * s), y + (95 * s), 5 * s, 20 * s); //right inner ear
			rect(x + (44 * s), y + (169 * s), 1 * s, 1 * s); //mouth
		}
		else if(this.userInput.direction == "left")
		{
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
			//main body part 2/2
			rect(x - (70 * s), y + (120 * s), 70 * s, 60 * s); //head
			rect(x - (30 * s), y + (80 * s), 20 * s, 40 * s); //left ear
			rect(x - (65 * s), y + (80 * s), 20 * s, 40 * s); //right ear
			rect(x - (32 * s), y + (140 * s), 2 * s, 20 * s); //left eye
			rect(x - (57 * s), y + (140 * s), 2 * s, 20 * s); //right eye

			//pink elements
			fill(255, 130, 197); // pink color
			stroke(255, 130, 197); // pink color
			rect(x - (25 * s), y + (95 * s), 5 * s, 20 * s); //left inner ear
			rect(x - (60 * s), y + (95 * s), 5 * s, 20 * s); //right inner ear
			rect(x - (45 * s), y + (169 * s), 1 * s, 1 * s); //mouth
		}
	else if(this.userInput.direction == "front")
	{
		stroke(0); //black outline color
		strokeWeight(5 * s); //black outline width
		fill(255); // white color
		

		//main body
		rect(x - 20, y + (150 * s), 45, 70); //body
		rect(x - (35 * s), y + (120 * s), 70 * s, 60 * s); //head
		rect(x - 25, y + (80 * s), 20 * s, 40 * s); //left ear
		rect(x + 8, y + (80 * s), 20 * s, 40 * s); //right ear
		rect(x - 15, y + (140 * s), 2 * s, 20 * s); //left eye
		rect(x + 15, y + (140 * s), 2 * s, 20 * s); //right eye

		//legs
		rect(x - 35, y + 200, 15 * s, 20); // front left leg
		rect(x + 25, y + (190 * s), 15 * s, 30); // front right leg
		rect(x + 2, y + 195, 0, 25); // leg in middle

		rect(x + 33, y + 188, 15 * s, 15 * s); //tail

		//pink elements
		fill(255, 130, 197); // pink color
		stroke(255, 130, 197); // pink color
		rect(x - 15, y + (95 * s), 5 * s, 20 * s); //left inner ear
		rect(x + 18, y + (95 * s), 5 * s, 20 * s); //right inner ear
		rect(x + 1, y + (169 * s), 1 * s, 1 * s); //mouth
	}
		
		

	}
};

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

	// if statements to control the animation of the character when
	// keys are released.
    
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
    else if (keyCode == 32 && gameChar_y == floorPos_y)
    {
        gameChar_y -= 100
        rabbitCharacter.userInput.airCondition = "jumping";
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
	rabbitCharacter.drawRabbit()
}