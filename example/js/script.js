$(document).ready(function(){

	var myDiapo = $(".diaporama1").jDiaporama({
		delay:2,
		theme:"design",
		useThumbs: true,
		thumbsDir: "img/galerie/thumbs/",
		width:512,
		height:288
	});
	
	$("#prev").click(function(){
		myDiapo.data("jDiaporama").prev();
	})
	
	$("#next").click(function(){
		myDiapo.data("jDiaporama").next();
	})
	
	$("#decreaseSlices").click(function(){
		nbSlices = myDiapo.data("jDiaporama").getOption('nbSlices');
		myDiapo.data("jDiaporama").changeOption("nbSlices", --nbSlices);
	})
	
	$(".diaporama1").parent().parent().parent().bind("jDiaporama:pause", function(event, pause){
		if(!pause)
			$("#togglePause").val("Pause");
		else
			$("#togglePause").val("Play");
	})
	
	$("#togglePause").click(function(){
		myDiapo.data("jDiaporama").pauseSlider();
	})

});