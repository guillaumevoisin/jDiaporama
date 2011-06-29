$(document).ready(function(){

	var myDiapo = $(".diaporama1").jDiaporama({
		transition:"random",
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
	
	$("#displayInfos").click(function(){
		myDiapo.data("jDiaporama").changeOption("transition", "slice");
	})
	

});