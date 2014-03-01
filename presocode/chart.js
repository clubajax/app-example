var chart = {};

chart.serieProxy = {
	series:[],
	addSerie: function(serie){
		this.series.push(serie);
		serie.proxy = this;
		chart.engine.addData(serie);
	},
	updateSize: function(){
		chart.engine.renderer.render();
	}
};
chart.engine = {
	addSerie: function(serie){
		chart.engine.renderer.addSerie(serie);
	},
	addData: function(serie){
		this.data.push(serie.settings.serie.data);
		serie.settings.serie.rect = this.getDimesionsFromSerie(serie);
		serie.proxy.updateSize();
	}
};

chart.engine.renderer = {
	addSerie: function(serie){
		chart.serieProxy.addSerie(serie);
	},
	render: function(){
		var rect = chart.serieProxy.series[0].settings.serie.rect;
		this.paintScreen(rect); // etc...
	}
};


object.setRect(w, h);
object.rect = {w:w, h:h};
object.settings.rect = {w:w, h:h};
object.rect({w:w, h:h});
object.dimensions(w, h, scaler);


chart.engine = {
	addGraph: function(graph){
		chart.engine.renderer.addGraph(graph);
	}
};

chart.engine.renderer = {
	constructor: function(){
		this.graphs = settingsArrayPropertyProxy();
	},
	addGraph: function(graph){
		
	}
};

Graphs = {
	create: function(settings){
		result = setData(settings.data);
		whenDone(function(){
			if(settings.onCallbackFinished){
				onCallbackFinished(result);
			}
		});
	}	
};

Chart = {
	constructor: function(){
		graphs.create({
			data:data,
			onCallbackFinished: this.onCallbackFinished.bind(this)
		});
	},
	onCallbackFinished: function(param){
		doSomething(param);
	}
}

Graphs = {
	create: function(settings){
		result = setData(settings.data);
		whenDone(function(){
			this.emit('done');
		});
	}	
};

Chart = {
	constructor: function(){
		graphs.on('done', this.onCallbackFinished.bind(this));
		graphs.create({
			data:data
		});
	},
	onCallbackFinished: function(param){
		doSomething(param);
	}
}

myName = obeservable('Mike');
console.log(myName); // Mike
obeservable('Bob');
console.log(myName); // Bob
myName.subscribe(function(value){
	if(value !== 'Mike'){
		console.log('Hey! My name is not ', value);
	}
});

graph = {
	removeSeries: function(serieId){
		var serieData = this.serieMap[serieId].getDataClone();
		this.serieMap[serieId].destroy();
		return serieData;
	}
}
chart = {
	removeSeries: function(seriesId){
		var graph = this.findSerieOwner();
		var seriesData = graph.removeSeries(seriesId);
		engine.removeSeriesData(seriesData);
		renderer.render();
	}
};


series = {
	remove: function(){
		this.emit('remove-series', this);
	}
}
graph = {
	constructor: function(){
		on('remove-series', function(series){
			delete this.seriesMap[series.id];
		}, this);
	}
}
chart = {
	constructor: function(){
		on('remove-series', function(series){
			engine.removeSeriesData(series.data);
			renderer.render();
		}, this);
	}
};

