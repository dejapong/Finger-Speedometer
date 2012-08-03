/**
	SVG Speedometer
  
  Author: Dejapong (http://dejapong.com)
  
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
Raphael.fn.speedometer = function(id,width,height){    
    //user accessible options
    var o = {
    	plateColor:"#555555", color1: "#ffffff", color2:  "#ffdd33", 
    	needleColor: "#ff6622",  needleHubColor: "#333333",
    	lightAngle:45, lightDistance:0.5,
    	//start and endangles are a little buggy
    	startNumber:0, endNumber:10, numNumbers:10, startAngle:-20, endAngle:200, 
		height:height, width:width,
		odometerText:"MPH",rumbleMagnitude:1,rumble:false
    };
    //object scope options
    var h = width*0.5,
        k = height*0.5,
        plateShade, plateRadius,
        textPadding,majorFontSize,
        bezelThickness, bezelShadeHeight, bezelHighlightHeight,  
        tickPadding,  minorTickWidth, majorTickWidth,
        needleHubRadius, needleHubHighlightColor, needleHubShadeColor, 
        needleHubHighlightHeight, needleHubShadeHeight,
        needleBaseWidth, needleTipWidth, needleLength, needleTailLength, 
        needleTailWidth, needleRight, needleLeft, needleGroup,needlePosition,
        rumble, pauseRumble, odometer;

	//paper
	var paper = Raphael(id,width,height);
	
	
	/*
	 Given a value, return the correct angle in degrees. 
	 If the needle has looped past the max value, returns angles > 360
	*/
	function getAngle(position){ 
		var needleRate = position/(o.endNumber-o.startNumber);
		var needleAngle = ((o.endAngle-2*o.startAngle)*needleRate)-90+o.startAngle; 
		return needleAngle;
	}

	/*return the color a side of the needle based off an angle*/
	function sideHighlight(angle,side){ 
		angle+=90-o.lightAngle;
		if (angle >= 360) angle %= 360; if (angle < 0) angle += 360; 
		var lightColor = "#fff"; var darkColor = "#000"; 
		if (angle > 0 && angle < 180)
			if (side =="right") return darkColor; else return lightColor;
		else
			if (side =="left") return darkColor; else return lightColor;
	}
	
  	//create the drawing
  	function init(weight){
  		paper.clear();
		plateRadius = (o.height * 0.5 - 10 * weight);
        textPadding = 50*weight;
        bezelThickness = 5*weight;
        bezelShadeHeight = 3*weight;
        bezelHighlightHeight = 3*weight;
        tickPadding = 14*weight;
        minorTickWidth = 3*weight;
        majorTickWidth = 5*weight;
        majorFontSize = 18*weight;
        needlePosition =0;
        needleHubRadius = 18 * weight; 
        needleHubHighlightHeight = 3*weight;
        needleHubShadeHeight = 3*weight;
        needleBaseWidth = 10*weight; 
		needleTipWidth = 4*weight;
		needleLength = 150*weight;
		needleTailLength = 35*weight; 
		needleTailWidth =7*weight; 		

        rumble = true;
        pauseRumble = false;
		//-------- Face Plate --------//
		var plate = paper.circle(h, k, plateRadius);
		var fillX = 0.5 - o.lightDistance* Math.cos(0.01745*o.lightAngle);
		var fillY = 0.5 - o.lightDistance* Math.sin(0.01745*o.lightAngle); 
		plateShade = "#"+((parseInt("0x"+o.plateColor.substr(1,6)) & 0xfefefe) >> 1).toString(16);
		plate.attr("fill", "r("+fillX+","+fillY+")" + o.plateColor  + "-" + plateShade);
		plate.attr({"stroke":"#333","stroke-width":0});
		
		//-------- Bezel --------// 
		fillX = h - bezelHighlightHeight*o.lightDistance* Math.cos(0.01745*o.lightAngle);
		fillY = k - bezelHighlightHeight*o.lightDistance* Math.sin(0.01745*o.lightAngle);
		var bezelHighlight = paper.circle(fillX,fillY, plateRadius); 
		fillX = h + bezelShadeHeight*o.lightDistance* Math.cos(0.01745*o.lightAngle);
		fillY = k + bezelShadeHeight*o.lightDistance* Math.sin(0.01745*o.lightAngle);
		var bezelShade = paper.circle(fillX,fillY, plateRadius); 
		var bezelFlat = paper.circle(h,k, plateRadius); 
		bezelShade.attr({"stroke":"#333","stroke-width":bezelThickness});
		bezelHighlight.attr({"stroke":"#fff","stroke-width":bezelThickness});
		bezelFlat.attr({"stroke":"#ccc","stroke-width":bezelThickness});
		
		//-------- Numbers and Tick marks --------// 
		for (i =0; i < o.numNumbers; i++){
			//-------- Numbers --------// 
			var ang = 0.01745*((o.endAngle-2*o.startAngle)/o.numNumbers),
				myAng = (i * ang)+o.startAngle*0.01745,
				myNum = i * (o.endNumber - o.startNumber)/o.numNumbers + o.startNumber,
				x = h - (plateRadius-textPadding-4*weight)*Math.cos(myAng),
				y = k - (plateRadius-textPadding-4*weight)*Math.sin(myAng),
				number = paper.text(x,y,Math.round(myNum)+" ");
			number.attr({"font-size":majorFontSize,"fill":o.color1});
			
			//-------- Tick Marks --------// 
			var tix = h - (plateRadius-textPadding+tickPadding)*Math.cos(myAng),
				tiy = k - (plateRadius-textPadding+tickPadding)*Math.sin(myAng),
				hix = h - (plateRadius-tickPadding)*Math.cos(myAng),
				hiy = k - (plateRadius-tickPadding)*Math.sin(myAng),
				majorTick = paper.path("M"+tix+" "+tiy+"L"+hix+" "+hiy);
			majorTick.attr({"stroke":o.color2,"stroke-width":majorTickWidth,"stroke-linecap":"butt","opacity":.65});
			if (i+1 != o.numNumbers){
				var myPadding = tickPadding * 1.5,
					myAng = myAng+ang*0.5,
					tix = h - (plateRadius-textPadding+myPadding)*Math.cos(myAng),
					tiy = k - (plateRadius-textPadding+myPadding)*Math.sin(myAng),
					hix = h - (plateRadius-myPadding)*Math.cos(myAng),
					hiy = k - (plateRadius-myPadding)*Math.sin(myAng),
					minorTick = paper.path("M"+tix+" "+tiy+"L"+hix+" "+hiy);
				minorTick.attr({"stroke":o.color1 ,"stroke-width":minorTickWidth,"stroke-linecap":"butt"});
			}
		};
		
		//-------- Inner Rim for Tick Marks --------// 
		var innerRimRadius = plateRadius-textPadding+tickPadding;
		var ix = h - (innerRimRadius)*Math.cos(o.startAngle*0.0178);
		var iy = k - (innerRimRadius)*Math.sin(o.startAngle*0.0178);
		var aix = h - (innerRimRadius)*Math.cos(o.endAngle*0.0175);
		var aiy = k - (innerRimRadius)*Math.sin(o.endAngle*0.0175);
		var rim = paper.path(
			"M" + ix + " " + iy
			+ "A " + innerRimRadius + " " + innerRimRadius
			+ "  10 1 1 " + aix + " " + aiy
		); 
		rim.attr({"stroke":o.color2,"stroke-width":minorTickWidth,"stroke-linecap":"round","opacity":.65}); 

		//-------- Digital Output --------//
		function display(){
			var decimalPlaces = 1; 
			var digitCount = 4,
				digitWidth = 45*weight,
				displayHeight = 50*weight,
				displayWidth = digitCount*digitWidth,
				displayX = h - displayWidth * 0.5,
				displayY = k + 70 * weight,
				display = paper.rect(displayX,displayY,displayWidth, displayHeight,5*weight);
			display.attr({fill:"#000"});
			var numbers = [];
			
			function displayNumber(x,white,value){
				var nextDigit; 
				var number = paper.rect(displayX+x,displayY,digitWidth,displayHeight);
				var numberText = paper.text(displayX+x+digitWidth*0.5,displayY+displayHeight*0.5,value);
				if (white){
					numberText.attr({fill:"#000"});
					number.attr({fill:"90-#444:0-#aaa:50-#444:100"});
				}else{
					numberText.attr({fill:"#fff"});
					number.attr({fill:"90-#222:0-#555:50-#222:100"});
				}
				numberText.attr({"font-size":digitWidth-3*weight});
				return {
					value:function(value){
						numberText.attr({text:value});
					},
					add:function(){
						var val = parseInt(numberText.attr("text"));
						val++;
						if (val == 10){
							val = 0;
							nextDigit.add(1);
						}
						numberText.attr({text:val});
					},
					setNextDigit:function(next){
						nextDigit = next
					},
					reset:function(){
						numberText.attr({text:"0"});
					}
				}
			}
			
			for (i = 0; i < digitCount-decimalPlaces; i++)
				numbers.push(new displayNumber(i*digitWidth,false,0));
			for (i=digitCount-decimalPlaces; i < digitCount; i++)
				numbers.push(new displayNumber(i*digitWidth,true,0));
			for (i=1; i < digitCount;i++)
				numbers[i].setNextDigit(numbers[i-1]);
			
			//odometer decimal
			var decimalHolder = paper.rect(displayX+(digitWidth*(digitCount-decimalPlaces))-2.5*weight,
									displayY+displayHeight-16*weight,
									7*weight,16*weight);
			decimalHolder.attr({fill:"#000","stroke-width":0});
			var decimal = paper.circle(displayX+(digitWidth*(digitCount-decimalPlaces))+1*weight,
									displayY+displayHeight-12*weight,
									4*weight);
			decimal.attr({fill:"#fff","stroke-width":4*weight,"stroke":"#000"});
			
			//odometer label	
			var text = paper.text(h,displayY + displayHeight + 15*weight,o.odometerText);
			text.attr({"fill":o.color1,"font-size":14*weight});

			return{
				scrollTo:function(value){
					for (i=0;i<numbers.length;i++)
						numbers[i].reset();
						
					setInterval(function(){
						if (value-- > 0)
							numbers[digitCount-1].add();
						else
							clearInterval(this);
					},10)				
				}
			}
		}		
		odometer = display();
		
				
		//-------- Needle and Needle Hub --------// 
		needleHubShadeColor = "#" + ((parseInt("0x"+o.needleHubColor.substr(1,6)) & 0xfefefe) >> 1).toString(16);
		needleHubHighlightColor ="#" + ( (parseInt("0x"+o.needleHubColor.substr(1,6)) & 0x7f7f7f) << 1).toString(16);
		fillX = h + needleHubShadeHeight*o.lightDistance* Math.cos(0.01745*o.lightAngle);
		fillY = k + needleHubShadeHeight*o.lightDistance* Math.sin(0.01745*o.lightAngle);
		var needleHubShade = paper.circle(fillX,fillY, needleHubRadius); 
		fillX = h - needleHubHighlightHeight*o.lightDistance* Math.cos(0.01745*o.lightAngle);
		fillY = k - needleHubHighlightHeight*o.lightDistance* Math.sin(0.01745*o.lightAngle);
		var needleHubHighlight = paper.circle(fillX,fillY, needleHubRadius); 
		var needleHub = paper.circle(h, k, needleHubRadius-1*weight); 
		needleHubHighlight.attr({"fill":needleHubHighlightColor,"stroke-width":0});
		needleHubShade.attr({"fill":needleHubShadeColor,"stroke-width":0});
		needleHub.attr({"fill":o.needleHubColor,"stroke-width":0});
	
		var needle = paper.path("M" + (h+needleTipWidth*0.5) + 	" " + (k-needleLength)
							   +"L" + (h+needleBaseWidth*0.5) + " " + k + " " 
							   +"L" + (h+needleTailWidth*0.5) + " " + (k+needleTailLength)
							   +"L" + (h-needleTailWidth*0.5) + " " + (k+needleTailLength)
							   +"L" + (h-needleBaseWidth*0.5) + " " + k
							   +"L" + (h-needleTipWidth*0.5) + 	" " + (k-needleLength)
							   +"z"
							   );
		needle.attr({"fill":o.needleColor,"stroke-width":0*weight,"cx":h,"cy":k});
		var length = needle.getTotalLength();  
		needleRight = paper.path(needle.getSubpath(0,length/2)).attr({stroke:"#fff",opacity:0.5}); 
		needleLeft = paper.path(needle.getSubpath(length/2,length)).attr({stroke:"#000",opacity:0.5}); 
		needleGroup = paper.set(); 
		needleGroup.push(needle); needleGroup.push(needleRight); needleGroup.push(needleLeft);
    	var angle = getAngle(needlePosition); 
    	needleGroup.rotate(angle,h,k); 
	}
	
	init(width/400);
    return{ 
    	//set needle to some value on the face
    	position:function(position){
    		var angle = getAngle(position); 
    		needleGroup.rotate(angle,h,k); 
    		needleLeft.attr({"stroke":sideHighlight(angle,"left")});
			needleRight.attr({"stroke":sideHighlight(angle,"right")});
	    	needlePosition = position;   
    	},
    	//accelerate needle to some value on the face. Optional time and easing
    	accelerate:function(position,time,easing){
			pauseRumble = true; 
    		if (!easing) easing = "elastic";
    		if (!time) time = 2000;
    		var angle = getAngle(position);
    		needleGroup.animate({"rotation": angle  + " " + h + " "  +k},time,easing,function(){
				pauseRumble = false; 
    		});
    		needleLeft.animateWith(needleGroup,{"stroke":sideHighlight(angle,"left")})
    		needleRight.animateWith(needleGroup,{"stroke":sideHighlight(angle,"right")})
	    	needlePosition = position;
    	},
    	//set various options
    	setOptions:function(options){
    		for (name in options) {o[name] = options[name];}
    		
    		init(o.width/400);
    		
    		//rumble if needed
    		clearInterval(rumble);
    		if (o.rumble)
				rumble = setInterval(function(){
					if (!pauseRumble){
						var rumblePos = needlePosition + (Math.random()-0.5)*o.rumbleMagnitude;
						var angle = getAngle(rumblePos); 
						needleGroup.animate({"rotation": angle  + " " + h + " "  +k},10); 
					}
				},100);
    	}, 
    	scrollTo:function(value){
    		odometer.scrollTo(value);
    	}
    }   
}
    
