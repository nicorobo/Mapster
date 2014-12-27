var Mapster = function(target){
	this.target = target;
	this.matrix = [1, 0, 0, 1, 0, 0];
	this.width = $('#map-container').width();
	this.height = $('#map-container').height();
	console.log(this.width);
}

Mapster.prototype = {
	pan: function(dx, dy){
		this.matrix[4]+= dx;
		this.matrix[5]+= dy;
		this.apply();
	},
	zoom: function(factor){
		for(var i=0; i<this.matrix.length; i++){
			this.matrix[i]*=factor;
		}
		this.matrix[4]+= (1-factor)*this.width/2;
		this.matrix[5]+= (1-factor)*this.height/2;
		this.apply();
	},
	reset: function(){
		this.matrix = [1, 0, 0, 1, 0, 0];
		this.apply();
	},
	apply: function(){
		var newTransformation = 'matrix('+this.matrix.join(' ')+')';
		$(this.target).attr('transform', newTransformation);
	}
}

var map = new Mapster('#map-matrix');

$('#controls').on('click', '.control', changeMap);

function changeMap(){
	var id = $(this).attr('id');
	if(id == 'reset') map.reset();
	if(id == 'zoomIn') map.zoom(3/2);
	if(id == 'zoomOut') map.zoom(2/3);
	if(id == 'up') map.pan(0, 30);
	if(id == 'down') map.pan(0, -30);
	if(id == 'left') map.pan(30, 0);
	if(id == 'right') map.pan(-30, 0);
}
