Raphael.fn.button = function(id,options){
	var o = {
		width:50,
		height:30,
		click:function(){},
		color:"#ccc"
	}
	for (name in options) {o[name] = options[name];}
	var paper = Raphael(id,o.width,o.height);
	var button = paper.rect(0,0,o.width,o.height,9);
	button.attr({fill:o.color});
	button.click(o.click);
}