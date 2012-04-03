Raphael.fn.slider = function(id,options){
	var o = {
		min:0,
		max:100,
		width:300,
		height:30,
		callback:function(){}
	}
	for (name in options) {o[name] = options[name];}
	var handleWidth = 10;
	var trackHeight = 5; 
	var mouseDown = false;
	var paper = Raphael(id,o.width,o.height);
	var track = paper.rect(handleWidth*0.5,o.height*0.5-trackHeight*0.5,
							o.width-handleWidth,trackHeight);
	var handle = paper.rect(0,0,handleWidth,o.height,3);
	
	function setHandle(location){
		if (location > o.width-handleWidth)
			location = o.width-handleWidth;
		if (location <= 0)
			location = 0; 
		handle.attr({"x":location}); 
		return (location/(o.width-handleWidth)) * (o.max - o.min) + o.min;
	}

	handle.attr({fill:"#ccc"});
	track.attr({fill:"#555"});
	
	var start = function(){
		handle.ox = this.attr("x");
	}
	var up = function(e){}
	var move = function(x,y){ 
		o.callback(setHandle(x+this.ox));		
	};
	
	handle.drag(move, start, up);
	return {
		setValue:function(value){
			var location = (o.width-handleWidth)*(value - o.min)/(o.max - o.min)	
			setHandle(location);
		}
	}
}