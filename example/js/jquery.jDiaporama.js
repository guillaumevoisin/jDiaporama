(function($){
	
	var jDiaporama = function(elt, options)
	{
		this.options = $.extend(defaults, options);
			
		/********************************************************************/
		/*** Global variables */
	
		var diapo = $(elt),
			mouseover = false,
			sens = options.sens,
			pause = false,
			current_slide = 0,
			nb_slides = $("li", diapo).length,
			inter = "",
			current = 1,
			effects = ["fade", "slide", "slidev", "slideDiago", "slidevInverse", /*"slice", "sliceHide", */"sliceBarsH", "sliceBarsHAlternate", "sliceBarsV", "sliceBarsVAlternate", "sliceBarsVFade"];
			isAnimating = false;
		
		diapo.wrap("<div class='jDiaporama_wrapper "+this.options.theme+"'><div class='jDiaporama'></div></div>");
		
		
		/********************************************************************/
		/*** Actions des mouseover */
		
		this.iniMouseActions = function()
		{
			var diapoObj = this;
			
			diapo.parent().mouseenter(function(){
				if(!mouseover)
				{
					mouseover = true;
					if(diapoObj.options.onrollover)
						diapoObj.displayInfos($("li.active", diapo), "show");

					diapo.siblings(".jDiaporama_controls").fadeIn();
				}
					
			}).mouseleave(function(){
				mouseover = false;
				if(diapoObj.options.onrollover)
					diapoObj.displayInfos($("li.active", diapo), "hide");

					diapo.siblings(".jDiaporama_controls").hide();
			});
		}
		
		/********************************************************************/
		/*** Keyboard navigation */
			
		this.initKeyBoard = function()
		{
			var diapoObj = this;
		
			$(document).keydown(function(event) {
				switch(event.keyCode){
					case 37 : // Flèche gauche
						diapoObj.prev();
					break;
					
					case 39 : // Flèche droite
						diapoObj.next();
					break;
				}
			});
		}
		
						
		/********************************************************************/
		/*** Controls */
		
		this.initControls = function()
		{
			var diapoObj = this;
		
			diapo.after("<div class='jDiaporama_controls'><a href='#' class='prev'>Prec.</a> " + ((this.options.auto)?"<a href='#' class='pause'>Pause</a>":"") + " <a href='#' class='next'>Suiv.</a></div>");
			
			$(".prev", diapo.siblings()).click(function(ev){
				ev.preventDefault();
				
				diapoObj.prev();
				return false;
			});
			
			$(".next", diapo.siblings()).click(function(ev){
				ev.preventDefault();
				
				diapoObj.next();
				return false;
			});
											
			$(".pause", diapo.siblings()).click(function(){
				if($(this).hasClass("pause"))
				{
					$(this).removeClass("pause").addClass("play");
					clearInterval(inter);
					pause = true;
				}
				else
				{
					$(this).removeClass("play").addClass("pause");
					inter = setInterval(function(){diapoObj.displayDiaporama(this.options)}, (this.options.delay*1000));
					pause = false;
				}
				
				return false;
			});
		}
		
		/********************************************************************/
		/*** Status Controls */
		
		this.initStatusControls = function()
		{
			var diapoObj = this;
		
			// Etat du diaporama
			diapo.parent().after("<div class='jDiaporama_status'></div>");
			$("li", diapo).each(function(){
				i = parseInt($("li", diapo).index($(this))+1);
				
				bullet = "<a id='jDiaporama_bullet_"+i+"' href='#'";
				
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
						log("Le répertoire des miniatures n'a pas pu être trouvé.", "error");
				}
					
				bullet += ">Image "+i+"</a>";
				
				$(".jDiaporama_status", diapo.parent().parent()).append(bullet);
			})
			
			$(".jDiaporama_status", diapo.parent().parent()).width($(".jDiaporama_status", diapo.parent().parent()).width());
			
			$(".jDiaporama_status a", diapo.parent().parent()).click(function(){
				currentId = $("li.active", diapo).attr("id").split("_")[2];
				clickId = $(this).attr("id").split("_")[2];
				if(currentId != clickId && !isAnimating)
				{
					if(clickId < currentId)
						sens = "left";
					else
						sens = "right";
						
					diapoObj.nextImage(diapoObj.options, $(this));
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
			diapo.parent().parent().width(this.options.width);
			diapo.parent().height(this.options.height);
			
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
				
				i = parseInt($("li", diapo).index($(this))+1);
				$(this).attr("id", "jDiaporama_image_"+i);

				// Affichage de la description si renseigné et activé
				if(diapoObj.options.infos)
				{
					var is_desc = ($("img", elt).attr("title") != "");
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
				
				$("#jDiaporama_bullet_"+(parseInt($("li", diapo).index($("li:first-child", diapo)))+1), diapo.parent().parent()).addClass("active");
				$(".jDiaporama_status", diapo.parent().parent()).show();
			}
			
			if(this.options.auto && this.options.paused)
				$(".pause", diapo.siblings()).trigger("click");
				
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
		
		
		/********************************************************************/
		/*** Slide proccess */
		
		this.nextImage = function(options, elt)
		{					
			clearInterval(inter);
			id = elt.attr("id").split("_")[2];
			
			log("Image #"+id+" called.", "info");
			
			oldActive = $("li.active", diapo).clone();
			
			$("li.active", diapo).removeClass("active");
			$("li#jDiaporama_image_"+id, diapo).addClass("active");
			
			/*current = id;
			previousElt = (sens == "right")?elt.prev():elt.next();
		
			if(previousElt.attr("data-format") == "landscape")
			{
				*/if(this.options.transition == "random")
				{
					rand = Math.floor(Math.random() * effects.length);
					effect = effects[rand];
				}
				else
					effect = this.options.transition;
			/*}else
				effect = "fade";*/
				
			isAnimating = true;
			log("Transition animation starts.", "info");
			this.options.animationStarts.call(this);
			
			/********************************************************************/
			/*** Effects */
			
			var diapoObj = this;
			
			/*** FADE ***/
			
			if(effect == "fade")
			{
				diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
				
				diapo.stop().css("left", -((id-1)*this.options.width));
			
				$(".fade-tmp").width(this.options.width).height(this.options.height).fadeOut(this.options.animationSpeed, function(){ $(this).remove(); diapoObj.processAnimationEnd() });
				$("li#jDiaporama_image_"+id, diapo).hide().fadeIn(this.options.animationSpeed);
			}
			
			/*** OTHER ***/
			
			else if(effect == "sliceHide" || effect == "slice" || effect == "sliceBarsVFade" || effect == "sliceBarsVAlternate" || effect == "sliceBarsV" || effect == "sliceBarsHAlternate" || effect == "sliceBarsH")
			{
				if($(".fade-tmp"))
					$(".fade-tmp").remove();
			
				diapo.parent().prepend("<div class='fade-tmp'></div>");
				
				img = $("img", oldActive);
				
				
				/*** SLICE / SLICEHIDE ***/
				
				if(effect == "slice" || effect == "sliceHide")
				{
					for(i=0; i<diapoObj.options.nbSlices; i++)
					{
						var sliceWidth = Math.round(this.options.width/diapoObj.options.nbSlices);
						var sliceHeight = Math.round(this.options.height/diapoObj.options.nbSlices);
						
						for(j=0; j<diapoObj.options.nbSlices; j++)
						{							
							if(i == diapoObj.options.nbSlices-1){
							
								if(j == diapoObj.options.nbSlices-1){
									_height = (this.options.height-(sliceHeight*j))+'px';
								}
								else
									_height = sliceHeight+'px';
							
								$(".fade-tmp").append(
									$('<div class="jDiaporama-slice"></div>').css({ 
										left:(sliceWidth*i)+'px', width:(this.options.width-(sliceWidth*i))+'px',
										top:(sliceHeight*j)+'px', height:_height,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px -'+((sliceHeight + (j * sliceHeight)) - sliceHeight) +'px'
									})
								);
							}
							else {
								$(".fade-tmp").append(
									$('<div class="jDiaporama-slice"></div>').css({ 
										left:(sliceWidth*i)+'px', width:sliceWidth+'px',
										top:(sliceHeight*j)+'px',
										height:sliceHeight+'px', 
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px -'+((sliceHeight + (j * sliceHeight)) - sliceHeight) +'px'
									})
								);
							}
						}
					}
					
					diapo.stop().css("left", -((id-1)*this.options.width));
					
					var i, timeout = 0;
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					slices.each(function(i, elt){
						if(i == (diapoObj.options.nbSlices*diapoObj.options.nbSlices)-1)
						{
							if(effect == "sliceHide")
								setTimeout(function(){ $(elt).hide("fast", function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
							else
								setTimeout(function(){ $(elt).fadeOut("fast", function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
						}
						else
						{
							if(effect == "sliceHide")
								setTimeout(function(){ $(elt).hide("fast", function(){ $(this).remove(); }) }, (timeout));
							else
								setTimeout(function(){ $(elt).fadeOut("fast", function(){ $(this).remove(); }) }, (timeout));
						}
							
						timeout += 7;
						i++;
					});
				}
				
				/*** SLICEBARSH***/
				
				else if(effect == "sliceBarsH")
				{
					for(i=0; i<diapoObj.options.nbSlices; i++)
					{
						var sliceWidth = Math.round(this.options.width/diapoObj.options.nbSlices);
						
						if(i == diapoObj.options.nbSlices-1){
						
							$(".fade-tmp").append(
								$('<div class="jDiaporama-slice"></div>').css({ 
									left:(sliceWidth*i)+'px', width:(this.options.width-(sliceWidth*i))+'px',
									height:this.options.height,
									opacity:'1', 
									background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
								})
							);
						}
						else {
							$(".fade-tmp").append(
								$('<div class="jDiaporama-slice"></div>').css({ 
									left:(sliceWidth*i)+'px', width:sliceWidth+'px',
									height:this.options.height,
									opacity:'1', 
									background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
								})
							);
						}
					}
					
					diapo.stop().css("left", -((id-1)*this.options.width));
					
					var i, timeout = 0;
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					slices.each(function(i, elt){
						if(i == (diapoObj.options.nbSlices)-1)
						{
							setTimeout(function(){ $(elt).animate({height: 0, opacity:0}, function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
						}
						else
							setTimeout(function(){ $(elt).animate({height: 0, opacity:0}, function(){ $(this).remove(); }) }, (timeout));
							
						timeout += 50;
						i++;
					});
				}
				
				/*** SLICEBARSH ALTERNATE ***/
				
				else if(effect == "sliceBarsHAlternate")
				{
					for(i=0; i<diapoObj.options.nbSlices; i++)
					{
						var sliceWidth = Math.round(diapoObj.options.width/diapoObj.options.nbSlices);
						
						if(i == diapoObj.options.nbSlices-1){
						
							$(".fade-tmp").append(
								(i%2 == 0)?
									$('<div class="jDiaporama-slice"></div>').css({ 
										left:(sliceWidth*i)+'px', width:(diapoObj.options.width-(sliceWidth*i))+'px',
										top:0,
										height:diapoObj.options.height,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
									})
								:
									$('<div class="jDiaporama-slice"></div>').css({ 
										left:(sliceWidth*i)+'px', width:(diapoObj.options.width-(sliceWidth*i))+'px',
										bottom:-diapoObj.options.height,
										height:diapoObj.options.height,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
									})
							);
						}
						else {
							$(".fade-tmp").append(
								(i%2 == 0)?
									$('<div class="jDiaporama-slice"></div>').css({ 
										left:(sliceWidth*i)+'px', width:sliceWidth+'px',
										top:0,
										height:diapoObj.options.height,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
									})
								:
									$('<div class="jDiaporama-slice"></div>').css({ 
										left:(sliceWidth*i)+'px', width:sliceWidth+'px',
										bottom:-diapoObj.options.height,
										height:diapoObj.options.height,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
									})
							);
						}
					}
					
					diapo.stop().css("left", -((id-1)*diapoObj.options.width));
					
					var i, timeout = 0;
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					slices.each(function(i, elt){
						if(i == (diapoObj.options.nbSlices)-1)
						{
							setTimeout(function(){ $(elt).animate({height: 0, opacity:0}, function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
						}
						else
							setTimeout(function(){ $(elt).animate({height: 0, opacity:0}, function(){ $(this).remove(); }) }, (timeout));
							
						timeout += 50;
						i++;
					});
				}
				
				/*** SLICEBARSV ***/
				
				else if(effect == "sliceBarsV")
				{
					for(i=0; i<diapoObj.options.nbSlices; i++)
					{
							var sliceHeight = Math.round(diapoObj.options.height/diapoObj.options.nbSlices);
						
						if(i == diapoObj.options.nbSlices-1){
						
							$(".fade-tmp").append(
								$('<div class="jDiaporama-slice"></div>').css({ 
									top:(sliceHeight*i)+'px', height:(diapoObj.options.height-(sliceHeight*i))+'px',
									width:diapoObj.options.width,
									opacity:'1', 
									background: 'url("'+ img.attr('src') +'") no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px'
								})
							);
						}
						else {
							$(".fade-tmp").append(
								$('<div class="jDiaporama-slice"></div>').css({ 
									top:(sliceHeight*i)+'px', height:sliceHeight+'px',
									width:diapoObj.options.width,
									opacity:'1', 
									background: 'url("'+ img.attr('src') +'") no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px'
								})
							);
						}
					}
					
					diapo.stop().css("left", -((id-1)*diapoObj.options.width));
					
					var i, timeout = 0;
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					slices.each(function(i, elt){
						if(i == (diapoObj.options.nbSlices)-1)
						{
							setTimeout(function(){ $(elt).animate({width: 0, opacity:0}, function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
						}
						else
							setTimeout(function(){ $(elt).animate({width: 0, opacity:0}, function(){ $(this).remove(); }) }, (timeout));
							
						timeout += 50;
						i++;
					});
				}
				
				/*** SLICEBARSV ALTERNATE ***/
				
				else if(effect == "sliceBarsVAlternate")
				{
					for(i=0; i<diapoObj.options.nbSlices; i++)
					{
							var sliceHeight = Math.round(diapoObj.options.height/diapoObj.options.nbSlices);
						
						if(i == diapoObj.options.nbSlices-1){
						
							$(".fade-tmp").append(
								(i%2 == 0)?
									$('<div class="jDiaporama-slice"></div>').css({ 
										top:(sliceHeight*i)+'px', height:(diapoObj.options.height-(sliceHeight*i))+'px',
										left:0,
										width:diapoObj.options.width,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px'
									})
								:
									$('<div class="jDiaporama-slice"></div>').css({ 
										top:(sliceHeight*i)+'px', height:(diapoObj.options.height-(sliceHeight*i))+'px',
										right:-diapoObj.options.width,
										width:diapoObj.options.width,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px'
									})
							);
						}
						else {
							$(".fade-tmp").append(
								(i%2 == 0)?
									$('<div class="jDiaporama-slice"></div>').css({ 
										top:(sliceHeight*i)+'px', height:sliceHeight+'px',
										left:0,
										width:diapoObj.options.width,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px'
									})
								:
									$('<div class="jDiaporama-slice"></div>').css({ 
										top:(sliceHeight*i)+'px', height:sliceHeight+'px',
										right:-diapoObj.options.width,
										width:diapoObj.options.width,
										opacity:'1', 
										background: 'url("'+ img.attr('src') +'") no-repeat 0 -'+ ((sliceHeight + (i * sliceHeight)) - sliceHeight) +'px'
									})
								
							);
						}
					}
					
					diapo.stop().css("left", -((id-1)*diapoObj.options.width));
					
					var i, timeout = 0;
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					slices.each(function(i, elt){
						if(i == (diapoObj.options.nbSlices)-1)
						{
							setTimeout(function(){ $(elt).animate({height: 0, opacity:0}, function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
						}
						else
							setTimeout(function(){ $(elt).animate({height: 0, opacity:0}, function(){ $(this).remove(); }) }, (timeout));
							
						timeout += 50;
						i++;
					});
				}
				
				
				/*** SLICEBARSVFADE ***/
				
				else if(effect == "sliceBarsVFade")
				{
					for(i=0; i<diapoObj.options.nbSlices; i++)
					{
						var sliceWidth = Math.round(diapoObj.options.width/diapoObj.options.nbSlices);
						
						if(i == diapoObj.options.nbSlices-1){
						
							$(".fade-tmp").append(
								$('<div class="jDiaporama-slice"></div>').css({ 
									left:(sliceWidth*i)+'px', width:(diapoObj.options.width-(sliceWidth*i))+'px',
									height:diapoObj.options.height,
									opacity:'1', 
									background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
								})
							);
						}
						else {
							$(".fade-tmp").append(
								$('<div class="jDiaporama-slice"></div>').css({ 
									left:(sliceWidth*i)+'px', width:sliceWidth+'px',
									height:diapoObj.options.height,
									opacity:'1', 
									background: 'url("'+ img.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0'
								})
							);
						}
					}
					
					diapo.stop().css("left", -((id-1)*diapoObj.options.width));
					
					var i, timeout = 0;
					
					slices = $(".jDiaporama-slice");
					if(sens == "left") slices = slices.reverse();
					
					slices.each(function(i, elt){
						if(i == (diapoObj.options.nbSlices)-1)
						{
							setTimeout(function(){ $(elt).animate({width: 0, opacity:0}, 650, function(){ $(this).remove(); $(".fade-tmp").remove(); diapoObj.processAnimationEnd() }) }, (timeout));
						}
						else
							setTimeout(function(){ $(elt).animate({width: 0, opacity:0}, 650, function(){ $(this).remove(); }) }, (timeout));
							
						timeout += 60;
						i++;
					});
				}
			}
			else if(effect == "slide")
			{
				diapo.stop().animate({left: -((id-1)*diapoObj.options.width)}, diapoObj.options.animationSpeed, function(){ diapoObj.processAnimationEnd() });
			}
			else if(effect == "slideDiago")
			{
				diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
			
				$(".fade-tmp").width(diapoObj.options.width).slideUp(diapoObj.options.animationSpeed, function(){ $(this).remove(); diapoObj.processAnimationEnd() });
				
				diapo.stop().css("top", diapoObj.options.height).animate({left: -((id-1)*diapoObj.options.width), top:0}, diapoObj.options.animationSpeed );
			}
			else if(effect == "slidev")
			{
				diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
				$(".fade-tmp .title, .fade-tmp .count, .fade-tmp .desc").remove();
			
				diapo.stop().css({top: diapoObj.options.height, left: -((id-1)*diapoObj.options.width)}).animate({top:0}, diapoObj.options.animationSpeed );
				$(".fade-tmp").width(diapoObj.options.width).animate({top:-diapoObj.options.height}, diapoObj.options.animationSpeed, function(){ $(this).remove(); diapoObj.processAnimationEnd() });

			}
			else if(effect == "slidevInverse")
			{
				diapo.parent().prepend("<div class='fade-tmp'>"+oldActive.html()+"</div>");
				$(".fade-tmp .title, .fade-tmp .count, .fade-tmp .desc").remove();
			
				diapo.stop().css({top: -diapoObj.options.height, left: -((id-1)*diapoObj.options.width)}).animate({top:0}, diapoObj.options.animationSpeed );
				$(".fade-tmp").width(diapoObj.options.width).animate({top:diapoObj.options.height}, diapoObj.options.animationSpeed, function(){ $(this).remove(); diapoObj.processAnimationEnd() });

			}
			else
			{
				diapo.stop().css("left", -((id-1)*diapoObj.options.width)); diapoObj.processAnimationEnd();
			}
			
			/********************************************************************/
			
			$(".jDiaporama_status a", diapo.parent().parent()).removeClass("active");

			if(this.options.status_controls)
				$("#jDiaporama_bullet_"+id, diapo.parent().parent()).addClass("active");

			if(this.options.infos && mouseover && this.options.onrollover)
				diapoObj.displayInfos($("li.active", diapo), "show");
			else if(!mouseover && this.options.onrollover)
				diapoObj.displayInfos($("li.active", diapo), "hide");
				
			if(!pause && this.options.auto)
			{
				if(this.options.boucles == 0 || (this.options.boucles > 0 && (diapo.data("current_slide")/diapo.children().length) < this.options.boucles ))
					inter = setInterval(function(){diapoObj.displayDiaporama(this.options)}, (this.options.delay*1000));
				else
					$(".pause", diapo.siblings()).remove();
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
		/*** Transitions Ends Processing */
		
		this.processAnimationEnd = function()
		{
			isAnimating = false;
			log("Transition animation stops.", "info");
			this.options.animationStops.call(this)
		}
		
		/********************************************************************/
		/*** Change option */
		
		this.changeOption = function(option, value)
		{
			this.options[option] = value;
		}
		
		
		/********************************************************************/
		/*** Lancement du diaporama */
		
		var diapoObj = this;
		
		this.init(); log("jDiaporama initiated.", "info"); this.options.onceLoaded.call(this);
		
		if(this.options.auto && !this.options.paused)
			inter = setInterval(function(){diapoObj.displayDiaporama(this.options)}, (this.options.delay*1000));
		
		//$("li", diapo).hide();
		$("li:first-child", diapo).addClass("active").fadeIn(this.options.animationSpeed);	
	}
		
	
	/*****************************************************************************/
	/**** PLUGIN OPTIONS
	/*****************************************************************************/
	
	var defaults = {
		auto: false,
		delay: 3,
		animationSpeed: "slow",
		controls: true,
		status_controls: true,
		keyboard: true,
		infos: true,
		onrollover: true,
		currentimage: true,
		paused: false,
		boucles: 0,
		sens: "right",
		random: false,
		transition:"fade",
		theme: "default",
		useThumbs: false,
		thumbsDir: null,
		constraintWidth: true,
		nbSlices: 10,
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
	
})(jQuery);