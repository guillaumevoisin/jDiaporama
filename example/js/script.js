$(document).ready(function(){

	var myDiapo = $(".diaporama1").jDiaporama({
		debugMode: true,
		transition:"slide",
		delay:2,
		theme:"design",
		useThumbs: true,
		thumbsDir: "img/galerie/thumbs/",
		width:512,
		height:288/*,
		imageClick: function(elt){ alert(elt.attr("id")); }*/
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
	
	$("#themeSwitcher").change(function(){
		$(".jDiaporama").removeClass("design border").addClass($(this).val());
	})
	
	var myDiapo2 = $(".diaporama2").jDiaporama({
		debugMode: true,
		transition:"fade",
		delay:2,
		theme:"design",
		useThumbs: false,
		width:288,
		height:384
	});

});