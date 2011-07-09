(function($){
	
	var jDiaporama = function(elt, options)
	{
		this.options = $.extend({}, defaults, options);
			
		/********************************************************************/
		/*** Private variables */
	
		var diapo = $(elt),
			mouseover = false,
			sens = this.options.sens,
			pause = false,
			current_slide = 0,
			nb_slides = $("li", diapo).length,
			inter = "",
			current = 1,
			effects = ["fade", "slide", "slidev", "slideDiago", "slidevInverse", "slice", "sliceHide", "sliceBarsH", "sliceBarsHAlternate", "sliceBarsV", "sliceBarsVAlternate", "sliceBarsVFade", "boxRandom"];
			isAnimating = false;
		
		diapo.wrap("<div class='jDiaporama "+this.options.theme+"'><div class='jDiaporama_wrapper'><div class='jDiaporama_slider'></div></div></div>");
		var topParent = diapo.parent().parent().parent();
		
		/********************************************************************/
		/*** Actions des mouseover */
		
		this.iniMouseActions = function()
		{
			diapo.parent().parent().mouseenter($.proxy(function(){
				if(!mouseover)
				{
					mouseover = true;
					if(this.options.onrollover)
						this.displayInfos($("li.active", diapo), "show");
					
					$(".jDiaporama_controls", topParent).fadeIn();
				}
					
			}, this)).mouseleave($.proxy(function(){
				mouseover = false;
				if(this.options.onrollover)
					this.displayInfos($("li.active", diapo), "hide");

					$(".jDiaporama_controls", topParent).hide();
			}, this));
		}
		
		/********************************************************************/
		/*** Keyboard navigation */
			
		this.initKeyBoard = function()
		{		
			$(document).keydown($.proxy(function(event) {
				switch(event.keyCode){
					case 37 : // Flèche gauche
						this.prev();
					break;
					
					case 39 : // Flèche droite
						this.next();
					break;
				}
			}, this));
		}
		
						
		/********************************************************************/
		/*** Controls */
		
		this.initControls = function()
		{		
			$(".jDiaporama_wrapper", topParent).append("<div class='jDiaporama_controls'><a href='#' class='prev'>Prec.</a> " + ((this.options.auto)?"<a href='#' class='pauseBtn pause'>Pause</a>":"") + " <a href='#' class='next'>Suiv.</a></div>");
			
			$(".prev", topParent).click($.proxy(function(ev){
				ev.preventDefault();
				
				this.prev();
				return false;
			}, this));
			
			$(".next", topParent).click($.proxy(function(ev){
				ev.preventDefault();
				
				this.next();
				return false;
			}, this));
											
			$(".pauseBtn", topParent).click($.proxy(function(){
				this.pauseSlider();
				
				return false;
			}, this));
		}
		
		/********************************************************************/
		/*** Status Controls */
		
		this.initStatusControls = function()
		{
			var diapoObj = this;

			// Etat du diaporama
			if(this.options.statusPosition == "top")
				$(".jDiaporama_wrapper", topParent).before("<div class='jDiaporama_status'></div>");
			else
				$(".jDiaporama_wrapper", topParent).after("<div class='jDiaporama_status'></div>");
			
			$("li", diapo).each(function(){
				i = parseInt($("li", diapo).index($(this))+1);
				
				bullet = "<a href='#'";
				
				if(diapoObj.options.useThumbs)
				{
					filename = $("img", $(this)).attr("src");
					tmp = filename.split("/");
					if(diapoObj.options.thumbsDir)
					{
						thumbname = diapoObj.options.thumbsDir+tmp[tmp.length-1];
						bullet += " class='imgBack' style='background-image:url("+thumbname+")'";
					}
					else
						if(this.options.debugMode) log("Le répertoire des miniatures n'a pas pu être trouvé.", "error");
				}
					
				bullet += ">Image "+i+"</a>";
				
				$(".jDiaporama_status", topParent).append(bullet);
			})
			
			$(".jDiaporama_status", topParent).width($(".jDiaporama_status", topParent).width());
			
			$(".jDiaporama_status a", topParent).click(function(){
				currentId = parseInt($("li", diapo).index($("li.active", diapo)));
				clickId = parseInt($(this).parent().children().index(this));

				if(currentId != clickId && !isAnimating)
				{
					if(clickId < currentId)
						sens = "left";
					else
						sens = "right";
						
					diapoObj.nextImage(diapoObj.options, $("li:eq("+clickId+")", diapo));
				}

					return false;
			})
		}
		
		/********************************************************************/
		/*** Initialisation du script */
		
		this.init = function()
		{
			var diapoObj = this;

			diapo.width(this.options.width*nb_slides);
			diapo.height(this.options.height);
			
			diapo.parent().width(this.options.width);
			diapo.parent().height(this.options.height);
			
			_w = diapo.parent().outerWidth();
			_h = diapo.parent().outerHeight();
			
			diapo.parent().width(this.options.width).parent().width(_w);
			
			
			/********************************************************************/
			/*** Initialisation des slides */
			
			$("li", diapo).each(function(){
				elt = $(this);
				
				if($("img", elt).height() > $("img", elt).width() && $("img", elt).height() > diapoObj.options.height && diapoObj.options.constraintWidth)
				{
					ratio = diapoObj.options.width / diapoObj.options.height;
					$("img", elt).height($("img", elt).height()/ratio);
				}
				
				if($("img", elt).height() > $("img", elt).width())
					elt.attr("data-format", "portrait");
				else
					elt.attr("data-format", "landscape");
				
				elt.width(diapoObj.options.width);
				elt.height(diapoObj.options.height);

				// Affichage de la description si renseigné et activé
				if(diapoObj.options.infos)
				{
					var is_desc = ($("img", elt).attr("title") != "" && $("img", elt).attr("title") != undefined);
					var is_title = ($("img", elt).attr("alt") != "");
											
					if(is_desc)
						elt.append("<p class='desc'>"+$("img", elt).attr("title")+"</p>");
						
					if(is_title)
						elt.append("<p class='title'>"+$("img", elt).attr("alt")+"</p>");
					
					if(diapoObj.options.currentimage)
						elt.append("<p class='count'>"+parseInt($("li", diapo).index(elt)+1)+"/"+diapo.children().length+"</p>");
				}
			})
				
			$("img", diapo).bind("click", function(){
				diapoObj.options.imageClick.call(this, $(this).parent());
			})
			
						
			/********************************************************************/
			/*** General */
			
			if(this.options.controls)
			{
				this.initControls();
				this.iniMouseActions();
			}
			
			if(this.options.keyboard)
				this.initKeyBoard();
			
			if(this.options.status_controls)
			{
				this.initStatusControls();
				
				$(".jDiaporama_status a:first-child", topParent).addClass("active");
				$(".jDiaporama_status", topParent).show();
			}
			
			if(this.options.auto && this.options.paused)
				$(".pauseBtn", topParent).trigger("click");
				
			if(!this.options.onrollover)
				this.displayInfos($("li", diapo), "show");
		}
		
		
		/********************************************************************/
		/*** Next slide */
		
		this.next = function()
		{
			if(!isAnimating)
			{
				if(this.options.random)
					this.randomImage();
				else
				{
					if(!$("li.active", diapo).is(":last-child"))
						elt =  $("li.active", diapo).next();
					else
						elt =  $("li:first-child", diapo);
						
					sens = "right";
					this.nextImage(this.options, elt);
				}
			}
		}
		
		
		/********************************************************************/
		/*** Previous slide */
		
		this.prev = function()
		{
			if(!isAnimating)
			{
				if(this.options.random)
					randomImage();
				else
				{
					if(!$("li.active", diapo).is(":first-child"))
					{
						elt =  $("li.active", diapo).prev();
					}
					else
						elt =  $("li:last-child", diapo);
						
					sens = "left";
					this.nextImage(this.options, elt);
				}
			}
		}
		
		
		/********************************************************************/
		/*** Random slide */
		
		this.randomImage = function()
		{
			rand = Math.floor(Math.random() * nb_slides)+1;
			id = $("li.active", diapo).attr("id").split("_")[2];
			
			while(rand == id)
			{
				rand = Math.floor(Math.random() * nb_slides)+1;
			}
			
			nextImage(this.options, $("li#jDiaporama_image_"+rand, diapo));
		}
		
		/********************************************************************/
		/*** Pauser slider */
		
		this.pauseSlider = function()
		{
			var diapoObj = this;

			if(!pause)
			{
				$(".pauseBtn", topParent).removeClass("pause").addClass("play");
				clearInterval(inter);
				pause = true;
				if(this.options.debugMode) log("Diaporama paused", "info");
			}
			else
			{
				$(".pauseBtn", topParent).removeClass("play").addClass("pause");
				inter = setInterval(function(){diapoObj.displayDiaporama(diapoObj.options)}, (diapoObj.options.delay*1000));
				pause = false;
				if(this.options.debugMode) log("Diaporama resumed", "info");
			}
			topParent.trigger("jDiaporama:pause", pause);
		}
			
		/********************************************************************/
		/*** Display information */
		
		this.displayInfos = function(elt, display)
		{
			var is_desc = ($("img", elt).attr("title") != "");
			var is_title = ($("img", elt).attr("alt") != "");
		
			if(is_desc)
				if(display == "show")
					$(".desc", elt).slideDown("fast");
				else
					$(".desc", elt).slideUp("fast");
			if(is_title)
				if(display == "show")
					$(".title", elt).slideDown("fast");
				else
					$(".title", elt).slideUp("fast");
			if(this.options.currentimage)
				if(display == "show")
					$(".count", elt).slideDown("fast");
				else
					$(".count", elt).slideUp("fast");
		}
		
		this.createSlices = function(img, className)
		{
			var allSlices = "";
	
			for(i=0; i<diapoObj.options.nbSlices; i++)
			{
				var sliceWidth = Math.round(this.options.width/diapoObj.options.nbSlices);
				
				if(i == diapoObj.options.nbSlices-1){

					allSlices += '<div class="jDiaporama-slice" style="left:'+(sliceWidth*i)+'px; width:'+(this.options.width-(sliceWidth*i))+'px; height:'+this.options.height+'px; opacity:1; background: url('+ img.attr('src') +') no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0"></div>';
				}
				else {
					allSlices += '<div class="jDiaporama-slice" style="left:'+(sliceWidth*i)+'px; width:'+sliceWidth+'px; height:'+this.options.height+'px; opacity:1; background: url('+ img.attr('src') +') no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0"></div>';
				}
			}
			
			$("."+className).append(allSlices);
		}
		
		this.createSlicesH = function(img, className)
		{
			var allSlices = "";
	
			for(i=0; i<diapoObj.options.nbSlices; i++)
			{
				var sliceHeight = Math.round(this.options.height/diapoObj.options.nbSlicesH);
				
				if(i == diapoObj.options.nbSlices-1){

					allSlices += '<div class="jDiaporama-slice" style="top:'+(sliceHeight*i)+'px; height:'+(this.options.height-(sliceHeight*i))+'px; width:'+this.options.width+'px; opacity:1; background: url('+ img.attr('src') +') no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px"></div>';
				}
				else {
					allSlices += '<div class="jDiaporama-slice" style="top:'+(sliceHeight*i)+'px; height:'+sliceHeight+'px; width:'+this.options.width+'px; opacity:1; background: url('+ img.attr('src') +') no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px"></div>';
				}
			}
			
			$("."+className).append(allSlices);
		}
		
		this.createBoxes = function(img)
		{
			var allBoxes = "";
			
			for(i=0; i<this.options.nbSlices; i++)
			{
				var sliceWidth = Math.round(this.options.width/diapoObj.options.nbSlices);
				var sliceHeight = Math.round(this.options.height/diapoObj.options.nbSlicesH);
				
				for(j=0; j<this.options.nbSlices; j++)
				{							
					if(i == diapoObj.options.nbSlices-1){
					
						if(j == diapoObj.options.nbSlices-1){
							_height = (this.options.height-(sliceHeight*j));
						}
						else
							_height = sliceHeight;
							
						allBoxes += '<div class="jDiaporama-slice" style="left:'+(sliceWidth*i)+'px; width:'+(this.options.width-(sliceWidth*i))+'px; top: '+(sliceHeight*j)+'px; height:'+_height+'px; opacity:1; background:url('+ img.attr('src') +') no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px -'+((sliceHeight + (j * sliceHeight)) - sliceHeight) +'px"></div>';
					}
					else {
						allBoxes += '<div class="jDiaporama-slice" style="left:'+(sliceWidth*i)+'px; width:'+sliceWidth+'px; top: '+(sliceHeight*j)+'px; height:'+sliceHeight+'px; opacity:1; background:'+'url('+ img.attr('src') +') no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px -'+((sliceHeight + (j * sliceHeight)) - sliceHeight) +'px"></div>';
					}
				}
			}
			
			$(".fade-tmp").append(allBoxes);
		}
		
		/********************************************************************/
		/*** Slide proccess */
		
		this.nextImage = function(options, elt)
		{
			clearInterval(inter);
			id = $("li", diapo).index(elt);
			
			if(this.options.debugMode) log("Image #"+id+" called.", "info");
			
			oldActive = $("li.active", diapo).clone();
			
			$("li.active", diapo).removeClass("active");
			$("li:eq("+id+")", diapo).addClass("active");
			
			/*current = id;
			previousElt = (sens == "right")?elt.prev():elt.next();
		
			if(previousElt.attr("data-format") == "landscape")
			{
				*/if(this.options.transition == "random")
				{
					rand = Math.floor(Math.random() * effects.length);
					effect = effects[rand];
				}
				else if(typeof this.options.transition == "object")
				{
					rand = Math.floor(Math.random() * this.options.transition.length);
					effect = this.options.transition[rand];
				}
				else
					effect = this.options.transition;
			/*}else
				effect = "fade";*/
				
			if(this.options.debugMode) log("transition effect: "+effect, "info");

			diapo.trigger("jDiaporama:animationStarts");
			
			/********************************************************************/
			/*** Effects */
			
			var diapoObj = this;
			
			/*** FADE ***/
			
			if(effect == "fade")
			{
				diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
				diapo.stop().css("left", -((id)*this.options.width));
			
				$(".fade-tmp").width(this.options.width).height(this.options.height).fadeOut(this.options.animationSpeed, function(){ $(this).remove(); diapo.trigger("jDiaporama:animationEnds") });
				$("li:eq("+id+")", diapo).hide().fadeIn(this.options.animationSpeed);
			}
			
			/*** OTHER ***/
			
			else if(effect == "sliceHide" || effect == "slice" || effect == "sliceBarsVFade" || effect == "sliceBarsVAlternate" || effect == "sliceBarsV" || effect == "sliceBarsHAlternate" || effect == "sliceBarsH" || effect == "slidevInverse" || effect == "slidev" || effect == "slide" || effect == "slideDiago" || effect == "boxRandom")
			{
				if($(".fade-tmp"))
					$(".fade-tmp").remove();
			
				diapo.parent().prepend("<div class='fade-tmp'></div>");
				
				img = $("img", oldActive);
				
				/*** BOX RANDOM ***/
				if(effect == "boxRandom")
				{	
					/** setup **/
					this.createBoxes(img);
					diapo.stop().css("left", -((id)*this.options.width));

					slices = shuffle($(".jDiaporama-slice"));

					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=7)
					{
						$(slices[i]).delay(timeout).animate({opacity:0}, diapoObj.options.animationSpeed, function(){ $(slices[i]).remove() })
						if(i == t-1)
							diapo.trigger("jDiaporama:animationEnds");
					}
				}
				
				/*** SLICE / SLICEHIDE ***/
				
				if(effect == "slice" || effect == "sliceHide")
				{					
					/** setup **/
					this.createBoxes(img);
					diapo.stop().css("left", -((id)*this.options.width));

					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();

					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=7)
					{
						if(i == t-1)
						{
							if(effect == "sliceHide")
								$(slices[i]).delay(timeout).hide("fast", function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
							else
								$(slices[i]).delay(timeout).animate({display: 'none', opacity:0}, diapoObj.options.animationSpeed, function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
						}
						else
						{
							if(effect == "sliceHide")
								$(slices[i]).delay(timeout).hide("fast", function(){ $(slices[i]).remove(); })
							else
								$(slices[i]).delay(timeout).animate({display: 'none', opacity:0}, diapoObj.options.animationSpeed, function(){ $(slices[i]).remove(); })
						}
					}
				}
				
				/*** SLICEBARSH FOLLOW ***/
				
				else if(effect == "sliceBarsH")
				{
					/** setup **/
					diapo.parent().prepend("<div class='fade-tmp-next'></div>");
					
					this.createSlices(img, "fade-tmp");
					this.createSlices($("img", elt), "fade-tmp-next");
										
					slices = $(".fade-tmp .jDiaporama-slice");
					$(".fade-tmp-next .jDiaporama-slice").css("top", diapoObj.options.height);
					slicesNext = $(".fade-tmp-next .jDiaporama-slice");
					
					if(sens == "left")
					{
						slices = slices.reverse();
						slicesNext = slicesNext.reverse();
					}					
					
					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=80)
					{
						if(i == t-1)
						{
							$(slices[i]).delay(timeout).animate({top:-diapoObj.options.height}, 800, "easeInOutQuint", function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
							$(slicesNext[i]).delay(timeout).animate({top:0}, 800, "easeInOutQuint", function(){ $(slicesNext[i]).remove(); $(".fade-tmp-next").remove(); diapo.stop().css("left", -((id)*diapoObj.options.width)); })
						}
						else
						{
							$(slices[i]).delay(timeout).animate({top:-diapoObj.options.height}, 800, "easeInOutQuint", function(){ $(slices[i]).remove(); })
							$(slicesNext[i]).delay(timeout).animate({top:0}, 800, "easeInOutQuint", function(){ $(slicesNext[i]).remove(); })
						}
					}
				}
				
				/*** SLICEBARSH ALTERNATE ***/
				
				else if(effect == "sliceBarsHAlternate")
				{
					/** setup **/
					this.createSlices(img, "fade-tmp");
					diapo.stop().css("left", -((id)*diapoObj.options.width));
			
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=120)
					{
						if(i%2 == 0)
							$(slices[i]).css("bottom", -diapoObj.options.height);
						else
							$(slices[i]).css("top", 0);
					
						if(i == t-1)
						{
							$(slices[i]).delay(timeout).animate({height:0, opacity:0.5}, 600, "easeInOutExpo", function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
						}
						else
						{
							$(slices[i]).delay(timeout).animate({height:0, opacity:0.5}, 600, "easeInOutExpo", function(){ $(this).remove(); })
						}
					}
				}
				
				/*** SLICEBARSV FOLLOW ***/
				
				else if(effect == "sliceBarsV")
				{
					/** setup **/
					
					diapo.parent().prepend("<div class='fade-tmp-next'></div>");
					
					this.createSlicesH(img, "fade-tmp");
					this.createSlicesH($("img", elt), "fade-tmp-next");
										
					slices = $(".fade-tmp .jDiaporama-slice");
					$(".fade-tmp-next .jDiaporama-slice").css("left", diapoObj.options.width);
					slicesNext = $(".fade-tmp-next .jDiaporama-slice");
					
					if(sens == "left")
					{
						slices = slices.reverse();
						slicesNext = slicesNext.reverse();
					}					
					
					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=120)
					{
						if(i == t-1)
						{
							$(slices[i]).delay(timeout).animate({left:-diapoObj.options.width},  800, "easeInOutQuint", function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
							$(slicesNext[i]).delay(timeout).animate({left:0},  800, "easeInOutQuint", function(){ $(slicesNext[i]).remove(); $(".fade-tmp-next").remove(); diapo.stop().css("left", -((id)*diapoObj.options.width)); })
						}
						else
						{
							$(slices[i]).delay(timeout).animate({left:-diapoObj.options.width},  800, "easeInOutQuint", function(){ $(slices[i]).remove(); })
							$(slicesNext[i]).delay(timeout).animate({left:0},  800, "easeInOutQuint", function(){ $(slicesNext[i]).remove(); })
						}
					}
				}
				
				/*** SLICEBARSV ALTERNATE ***/
				
				else if(effect == "sliceBarsVAlternate")
				{
					/** setup **/
					this.createSlicesH(img, "fade-tmp");
					diapo.stop().css("left", -((id)*this.options.width));
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=120)
					{
						if(i%2 == 0)
							$(slices[i]).css("right", -diapoObj.options.width);
						else
							$(slices[i]).css("left", 0);
							
						if(i == t-1)
						{
							$(slices[i]).delay(timeout).animate({width:0, opacity:0.5}, 400, "easeInCirc", function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
						}
						else
						{
							$(slices[i]).delay(timeout).animate({width:0, opacity:0.5}, 400, "easeInCirc", function(){ $(this).remove(); })
						}
					}
				}
				
				
				/*** SLICEBARSVFADE ***/
				
				else if(effect == "sliceBarsVFade")
				{
					/** setup **/
					this.createSlicesH(img, "fade-tmp");
					diapo.stop().css("left", -((id)*this.options.width));
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					/** animation **/
					for(var i=0, timeout=0, t=slices.length; i<t; i++, timeout+=120)
					{
						if(i == t-1)
						{
							$(slices[i]).delay(timeout).animate({height:0, opacity:0.4}, 400, function(){ $(slices[i]).remove(); $(".fade-tmp").remove(); diapo.trigger("jDiaporama:animationEnds") })
						}
						else
						{
							$(slices[i]).delay(timeout).animate({height:0, opacity:0.4}, 400, function(){ $(this).remove(); })
						}
					}
				}
				
				/*** SLIDE ***/
				
				else if(effect == "slide")
				{
					diapo.stop().animate({left: -((id)*diapoObj.options.width)}, diapoObj.options.animationSpeed, diapoObj.options.animationEasing, function(){ diapo.trigger("jDiaporama:animationEnds") });
				}
				
				/*** SLIDE DIAGO ***/
				
				else if(effect == "slideDiago")
				{
					diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
				
					$(".fade-tmp").width(diapoObj.options.width).slideUp(diapoObj.options.animationSpeed, function(){ $(this).remove(); diapo.trigger("jDiaporama:animationEnds") });
					
					diapo.stop().css("top", diapoObj.options.height).animate({left: -((id)*diapoObj.options.width), top:0}, diapoObj.options.animationSpeed );
				}
				
				/*** SLIDE VERTICAL ***/
				
				else if(effect == "slidev")
				{
					diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
					$(".fade-tmp .title, .fade-tmp .count, .fade-tmp .desc").remove();
				
					diapo.stop().css({top: diapoObj.options.height, left: -((id)*diapoObj.options.width)}).animate({top:0}, diapoObj.options.animationSpeed, diapoObj.options.animationEasing );
					$(".fade-tmp").width(diapoObj.options.width).animate({top:-diapoObj.options.height}, diapoObj.options.animationSpeed, diapoObj.options.animationEasing, function(){ $(this).remove(); diapo.trigger("jDiaporama:animationEnds") });

				}
				
				/*** SLIDE INVERSE ***/
				
				else if(effect == "slidevInverse")
				{
					diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
					$(".fade-tmp .title, .fade-tmp .count, .fade-tmp .desc").remove();
				
					diapo.stop().css({top: -diapoObj.options.height, left: -((id)*diapoObj.options.width)}).animate({top:0}, diapoObj.options.animationSpeed, diapoObj.options.animationEasing );
					$(".fade-tmp").width(diapoObj.options.width).animate({top:diapoObj.options.height}, diapoObj.options.animationSpeed, diapoObj.options.animationEasing, function(){ $(this).remove(); diapo.trigger("jDiaporama:animationEnds") });
				}
			}	
			
			/*** DEFAULT NO ANIMATION ***/
				
			else
			{
				diapo.stop().css("left", -((id)*diapoObj.options.width)); diapo.trigger("jDiaporama:animationEnds");
				if(diapoObj.options.debugMode) log("Transition animation not found.", "error");
			}
				
			/********************************************************************/
			
			$(".jDiaporama_status a", topParent).removeClass("active");

			if(this.options.status_controls)
				$(".jDiaporama_status a:eq("+id+")", topParent).addClass("active");

			if(this.options.infos && mouseover && this.options.onrollover)
				diapoObj.displayInfos($("li.active", diapo), "show");
			else if(!mouseover && this.options.onrollover)
				diapoObj.displayInfos($("li.active", diapo), "hide");
				
			if(!pause && this.options.auto)
			{
				if(this.options.boucles == 0 || (this.options.boucles > 0 && (diapo.data("current_slide")/diapo.children().length) < this.options.boucles ))
					inter = setInterval(function(){diapoObj.displayDiaporama(this.options)}, (this.options.delay*1000));
				else
					$(".pauseBtn", topParent).remove();
			}
			
		}
		
		
		/********************************************************************/
		/*** Display diaporama */
		
		this.displayDiaporama = function(options)
		{
			current_slide++;
			diapo.data("current_slide", current_slide);
			
			if(sens == "right")
				this.next();
			else
				this.prev();
		}
		
		/********************************************************************/
		/*** Events handling */
		
		diapo.bind("jDiaporama:animationEnds", function()
		{
			isAnimating = false;
			if(diapoObj.options.debugMode) log("Transition animation stops.", "info");
			diapoObj.options.animationStops.call(this);
		});
		
		diapo.bind("jDiaporama:animationStarts", function()
		{
			isAnimating = true;
			if(diapoObj.options.debugMode) log("Transition animation starts.", "info");
			diapoObj.options.animationStarts.call(this);
		});
		
		/********************************************************************/
		/*** Change option */
		
		this.changeOption = function(option, value)
		{
			this.options[option] = value;
		}
		
		this.getOption = function(option)
		{
			return this.options[option];
		}
		
		
		/********************************************************************/
		/*** Lancement du diaporama */
		
		var diapoObj = this;
		
		this.init(); if(this.options.debugMode) log("jDiaporama initiated.", "info"); this.options.onceLoaded.call(this);
		
		if(this.options.auto && !this.options.paused)
			inter = setInterval(function(){diapoObj.displayDiaporama(this.options)}, (this.options.delay*1000));
		
		//$("li", diapo).hide();
		$("li:first-child", diapo).addClass("active").fadeIn(this.options.animationSpeed);	
	}
		
	
	/*****************************************************************************/
	/**** PLUGIN OPTIONS
	/*****************************************************************************/
	
	var defaults = {
		debugMode: false,
		auto: true,
		delay: 3,
		animationSpeed: "slow",
		controls: true,
		status_controls: true,
		statusPosition: "bottom",
		keyboard: true,
		infos: true,
		onrollover: true,
		currentimage: true,
		paused: false,
		boucles: 0,
		sens: "right",
		random: false,
		transition:"random",
		animationEasing: "easeInQuint",
		theme: "default",
		useThumbs: false,
		thumbsDir: null,
		constraintWidth: true,
		nbSlices: 10,
		nbSlicesH: 6,
		onceLoaded: function(){},
		animationStarts: function(){},
		animationStops: function(){},
		imageClick: function(){}
	};
	
	
	$.fn.jDiaporama = function(options)
	{
		/*****************************************************************************/
		/**** LOOP
		/*****************************************************************************/
		
		return this.each(function(i, elt){
			var jd = new jDiaporama(this, options);
			$(elt).data("jDiaporama", jd);
		});
	}
	
	/*****************************************************************************/
	/**** UTILS
	/*****************************************************************************/

	/********************************************************************/
	/*** Reverse an array */
					
	$.fn.reverse = [].reverse;
	
	/********************************************************************/
	/*** Shuffle an array */
	
	var shuffle = function (slices){
		var sl = slices;
		var i = sl.length, j, temp;
		if ( i == 0 ) return;
		while ( --i ) {
			j = Math.floor( Math.random() * ( i + 1 ) );
			temp = sl[i];
			sl[i] = sl[j];
			sl[j] = temp;
		}
		return sl;
	};
	
	/********************************************************************/
	/*** Mode Debug */

	function log(msg, type)
	{
		if (this.console && typeof console.log != "undefined")
		{
			switch(type)
			{
				case "info":
					console.info("jDiaporama -> "+type+": "+msg);
				break;
				
				case "warn":
					console.warn("jDiaporama -> "+type+": "+msg);
				break;
				
				case "error":
					console.error("jDiaporama -> "+type+": "+msg);
				break;
				
				default:
					console.error("jDiaporama -> "+"Debug: "+msg);
				break;
			}
		}
	}
	
	jQuery.easing['jswing'] = jQuery.easing['swing'];
	jQuery.extend( jQuery.easing,
	{
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) {
			//alert(jQuery.easing.default);
			return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
		},
		easeInQuad: function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function (x, t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function (x, t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function (x, t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function (x, t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function (x, t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		easeOutExpo: function (x, t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function (x, t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (x, t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function (x, t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		},
		easeInOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeInBounce: function (x, t, b, c, d) {
			return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
		},
		easeOutBounce: function (x, t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function (x, t, b, c, d) {
			if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
			return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	});
	
})(jQuery);