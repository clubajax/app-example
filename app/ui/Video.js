define([
	'core/dcl',
	'core/lang',
	'core/Widget'
], function(dcl, lang, Widget){

	return dcl(Widget, {
		declaredClass:'Video',
		template:'<video></video>',
		
		autoplay:false,
		controls:true,
		preload:true,
		autobuffer:true,
		buffer:false,
		volume:0.5,
		
		constructor: function(options, node){
			this.template = lang.mixProps({
				nodeName:0,
				autoplay:0,
				controls:0,
				preload:0,
				autobuffer:0,
				buffer:0,
				volume:0
			}, this);
		}
	});
});