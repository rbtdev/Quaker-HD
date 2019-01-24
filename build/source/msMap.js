//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

enyo.kind({
	name: "Map",
	kind: enyo.Control,
	components: [
		{name: "launcher",  
			kind: "PalmService",  
			service: "palm://com.palm.applicationManager/",  
			method: "open"
		},
		{name: "pinPopup", kind: "Popup", onBeforeOpen: "beforePopupOpen", components: [
			{name: "popupTitle", className: "q_popupTitle", content: ""},
			{kind: "VFlexBox",  className: "q_details", align: "center", components: [
				{name: "popupDescription", allowHtml: true, className: "q_summary"},
				{kind: "HFlexBox", className: "q_share", align: "center", components: [
					{name: "facebook", className: "facebook", content: "", onclick: "fbShare"},
					{name: "tweet", className: "twitter", content: "", onclick: "twShare"},
					{name: "email", className: "email", content: "", onclick :"emailShare"},
					{name: "sms", className: "sms", content: "", onclick: "smsShare"}
				]}
			]}
		]}
	],
	events: {onPinClick:"",
			 onLoaded:""
	},
	
	/* domAttributes: {
		"enyo-pass-events": true
	}, */
	
	create: function() {
		this.inherited(arguments);
		this.map = null;
		this.selectedPin = -1;
		this.inactivePinIcons = ["icons/pin_green.png","icons/pin_blue.png", "icons/pin_yellow.png", "icons/pin_red.png"];
		this.shadowIcon = "icons/shadow2.png";
		//this.homeIcon = "icons/pin_green.png";
		this.homeIcon = "icons/mylocation_sm.png";
		this.activePinIcon = "icons/target.png";
		this.mapZoom = this.zoom;
		this.loaded = false;
		this.mapsAvailable = false;
		this.loadAttempts = 0;
		this.activating = false;
		this.zoomHandlerId = null;
		if (typeof Microsoft  != "undefined" && typeof Microsoft.Maps != "undefined" && typeof Microsoft.Maps.Location != "undefined") {
			this.mapCenter = new Microsoft.Maps.Location(this.center.lat, this.center.long);
			this.mapsAvailable = true;
		}
	},
	
	load: function () {
		this.initializeMap();
	},
	
	initializeMap: function () {
		try {
			console.log("Creating Map Object. Attempt #" + this.loadAttempts);
			this.canvas = this.hasNode();
			this.map = new Microsoft.Maps.Map(this.canvas, 
									   {credentials: this.key,
										center: this.mapCenter,
										mapTypeId: Microsoft.Maps.MapTypeId.road,
										//mapTypeId: Microsoft.Maps.MapTypeId.aerial,
										showDashboard: false,
										zoom: this.mapZoom,
										disableKeyboardInput: true,
										enableClickableLogo: false,
										disableTouchInput: false,
										disableUserInput: false,
										disableMouseInput: false,
										enableSearchLogo: true
										});
			if (this.map) {
				console.log("Map Object Created...");
				//extend the pushpin class to store information for popup
				Microsoft.Maps.Pushpin.prototype.id = null;
				Microsoft.Maps.Pushpin.prototype.title = null;
				Microsoft.Maps.Pushpin.prototype.description = null;	
				Microsoft.Maps.Pushpin.prototype.shareUrl = null;
				Microsoft.Maps.Pushpin.prototype.clickHandler = null;
				Microsoft.Maps.Events.addThrottledHandler(this.map, 'mousedown', function () {this.$.pinPopup.close()}.bind(this),1);
				this.home = new Microsoft.Maps.EntityCollection({zIndex:99, visible: true});
				this.places = new Microsoft.Maps.EntityCollection({zIndex:1, visible:true});			
				this.shadows = new Microsoft.Maps.EntityCollection({zIndex:2, visible:true});			
				this.pins = new Microsoft.Maps.EntityCollection({zIndex:4, visible:true});
				this.activePins = new Microsoft.Maps.EntityCollection({zIndex:3, visible:true});
				this.activePin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(0, 0), 
					{visible: false, icon: this.activePinIcon, width: 64, height: 64, anchor:{x:32, y:32}});
				this.activePin.clickHandler = Microsoft.Maps.Events.addThrottledHandler(this.activePin, "click", this.pinClick.bind(this), 1);
				this.activePins.push(this.activePin);	
				this.map.entities.push(this.places);
				this.map.entities.push(this.shadows);
				this.map.entities.push(this.pins);	
				this.map.entities.push(this.activePins);
				this.map.entities.push(this.home);
				this.loaded = true;
				console.log("Map loaded...");
				this.doLoaded();
			}
		}
		catch (err) {
			console.log("Caught erorr: " + err.description);
			if (this.loadAttempts++ < 20) {
				setTimeout(this.initializeMap.bind(this), 500);
			}
			else {
				this.loaded = false;
				console.log("Unable to load map...");
				this.doLoaded();
				
			}
		}
	},
	
	setMapType: function (view) {
		console.log("setting map type: " + view);
		var mapTypeId = Microsoft.Maps.MapTypeId.road;
		switch (view) {
			case "road": 
				mapTypeId = Microsoft.Maps.MapTypeId.road;
			break;
			case "aerial":
				mapTypeId = Microsoft.Maps.MapTypeId.aerial;
			break;
			case "birdseye":
				mapTypeId = Microsoft.Maps.MapTypeId.birdseye;
			break;
		}
		var options = this.map.getOptions();
		options.mapTypeId = mapTypeId;
		this.map.setView(options);
	},
	
	zoomOut: function () {
		if (this.loaded) {
			this.deactivatePin();
			this.$.pinPopup.close();
			this.map.setView({center: this.mapCenter, zoom: this.mapZoom});
		}
	},
	
	setZoom: function (zoom) {
		console.log("Zooming: " + zoom);
		this.map.setView({zoom: zoom});
	},
	
	moveTo: function (lat, lon) {
		var position = new Microsoft.Maps.Location(lat, lon);
		this.map.setView({center: position});
	},

	zoomTo: function (pinIndex, showPopup) {
		if (this.loaded) {
			console.log("selectedPin = " + this.selectedPin);
			console.log("pinIndex = " + pinIndex);
			if (this.selectedPin != pinIndex) {	
				var pin = this.pins.get(pinIndex);
				console.log("Calling deactivatePin. selectedPin = " + this.selectedPin);
				this.deactivatePin();
				var latlng = pin.getLocation();	
				if (!this.zoomHandlerId) {
					this.zoomHandlerId = Microsoft.Maps.Events.addThrottledHandler(this.map, 'viewchangeend', 
						function () {
							console.log("ViewChanged");
							Microsoft.Maps.Events.removeHandler(this.zoomHandlerId);
							this.zoomHandlerId = null;
							this.activatePin(pinIndex, showPopup);
						}.bind(this),1);
				}
				console.log ("Calling setView: center = " + latlng);
				var options = {};
				options.zoom = 5;
				options.center = latlng;
				options.bounds = null;
				this.map.setView(options);
			}
			else {
				console.log("Re-activating pin");
				this.activatePin(pinIndex, showPopup);
			}
		}
	},
	
	clearPins: function() {
		if (this.loaded) {
			this.deactivatePin();
			this.$.pinPopup.close();
			this.places.clear();
			// this.circles.clear();
			this.pins.clear();
			this.shadows.clear();
		}
	},
	
	addHome: function (latitude, longitude) {
		if (this.loaded) {
			this.home.clear();
			var home = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location((latitude), 
													(longitude)),
													{icon: this.homeIcon, width: 24, height: 24, anchor:{x:12, y:12}}
												 );
			this.home.push(home);
		}
	},
	
	addPin: function (pinData) {
		if (this.loaded) {
			latitude = pinData.latitude;
			longitude = pinData.longitude;
			id = pinData.id;
			title = pinData.title;
			description = pinData.description;
			shareUrl = pinData.shareUrl;
			var mag = pinData.magnitude;
			var pinIcon = this.inactivePinIcons[3]; // red
			if (mag < 7) pinIcon = this.inactivePinIcons[2] // yellow
			if (mag < 5) pinIcon = this.inactivePinIcons[1] // blue
			if (mag < 3) pinIcon = this.inactivePinIcons[0] // green
			var pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parseFloat(latitude), parseFloat(longitude)), {icon: pinIcon, width: 72, height: 27, anchor:{x:36, y:27}});
			if (!pin.clickHandler) {
				pin.clickHandler = Microsoft.Maps.Events.addThrottledHandler(pin, "click", this.pinClick.bind(this),1);
			}
			pin.id = id;
			pin.title = title;
			pin.description = description;
			pin.shareUrl = shareUrl;
			this.pins.push(pin);
			//this.shadows.push(new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parseFloat(latitude), parseFloat(longitude)), {icon: this.shadowIcon, width: 72, height: 27, anchor:{x:36, y:27}}));
		}
	},

	beforePopupOpen: function () {
		this.$.popupTitle.setContent(this.activePin.title);
		this.$.popupDescription.setContent(this.activePin.description);
	},
	
	pinClick: function (e)  {
		
		e.cancelBubble = true;
		if (e.stopPropagation) {
		  e.stopPropagation();
		}
		this.$.pinPopup.close();
		if (e.targetType == 'pushpin'){
			console.log("Pin Click: id = " + e.target.id);
			var pin = e.target;
			//Microsoft.Maps.Events.removeHandler(pin.clickHandler);
			//pin.clickHandler = null;
			this.doPinClick(pin.id);
		}
	},
	
	deactivatePin: function () {
		if (this.loaded) {
			console.log("in deactivatePin. selected pin = " + this.selectedPin);
			if (this.selectedPin >= 0) {
				var pin = this.pins.get(this.selectedPin);
				console.log("making active pin invisible...");
				this.activePin.setOptions({visible:false});
				this.activePin.title = "";
				this.activePin.description = "";
				this.activePin.shareUrl = "";
				console.log("making standard pin visible...");
				//pin.setOptions({visible: true});
				if (!pin.clickHandler) {
					pin.clickHandler = Microsoft.Maps.Events.addThrottledHandler(pin, "click", this.pinClick.bind(this), 1);
				}
			}
			this.selectedPin = -1;
		}
	},
	
	activatePin: function (pinIndex, showPopup) {
		if (!this.activating) {
			this.activating = true;
			if (this.loaded) {
				var pin = this.pins.get(pinIndex);
				if (pin) {
					var location = pin.getLocation();
					this.activePin.setLocation(location);
					this.activePin.setOptions({visible: true});
					//pin.setOptions({visible: false});
					this.activePin.title = pin.title;
					this.activePin.description = pin.description;
					this.activePin.shareUrl = pin.shareUrl;
					this.activePin.id = pin.id;
					if (showPopup){
						this.$.pinPopup.close();
						var pix = this.map.tryLocationToPixel(location, Microsoft.Maps.PixelReference.control);
						this.$.pinPopup.openAt({top:pix.y+20, left:pix.x-20});
					}
				}
				this.selectedPin = pinIndex;
			}
		}
		this.activating = false;
	},
	
	toRadians: function (deg) {
		return (deg*Math.PI / 180.0);
	},
	
	toDegrees: function (rads) {
		return (rads*180.0/Math.PI);
	},
	
	
	createCircle: function(latitude, longitude, mag) {
   
		var colors = [	{r:0,	g:255,	b:0  	},
						{r:0,	g:255,	b:255	},	
						{r:255,	g:255,	b:0		},
						{r:255,	g:0,	b:0		}
					 ];
		var radius = mag*5;
		var earthRadius = 3956;
		var lat = this.toRadians(latitude); //radians
		var lon = this.toRadians(longitude); //radians
		var d = parseFloat(radius) / earthRadius;  // d = angular distance covered on earth's surface
		var locs = new Array();
		for (var x = 0; x <= 360; x++) 
		{ 
			var p2 = new Microsoft.Maps.Location(0, 0);       
			brng = this.toRadians(x); //radians
			
			var latRadians = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng));
			var lngRadians = lon + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(latRadians));
			locs.push(new Microsoft.Maps.Location(this.toDegrees(latRadians), this.toDegrees(lngRadians)));
		}
		
		var color = colors[0];
		if (mag >= 3.0 && mag < 4.0) {
			color = colors[1];
		}
		else if (mag >= 4.0 && mag < 5.0) {
			color = colors[2];
		}
		else if (mag >= 5.0) {
			color = colors[3];
		}
		var polygoncolor = new Microsoft.Maps.Color(128,color.r,color.g,color.b);
		var strokeColor = new Microsoft.Maps.Color(255,0,0,0);
		var polygon = new Microsoft.Maps.Polygon(locs,{fillColor: polygoncolor, strokeColor: strokeColor, strokeThickness: 1});
		return (polygon);
	},
	
	fbShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var fbUrl = "http://facebook.com/sharer.php?u=" + escape(this.activePin.shareUrl);	
		console.log("launching browser: " + fbUrl);		
		this.$.launcher.call({id: "com.palm.app.browser", params:{target: fbUrl}});
	},
	
	twShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var tweetText = escape("#earthquake: " + this.activePin.title + " (source: @usgs)");
		var tweetUrl = "http://twitter.com/share?url=" + escape(this.activePin.shareUrl) + "&text=" + tweetText + "&via=Quaker_webOS";
		console.log("launching browser: " + tweetUrl);		
		this.$.launcher.call({id: "com.palm.app.browser", params:{target: tweetUrl}});
	},
	
	emailShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var subject = "Earthquake: " + this.activePin.title
		var body = "<p>&nbsp</p><p>&nbsp</p>"
				+ "<p>" + this.activePin.description + "</p>"
				+ "<div style='clear:both; margin-top: 75px;'>For more information go to: <a href = '"
				+ this.activePin.shareUrl
				+ "'>"
				+ this.activePin.shareUrl
				+ "</a></p><br><hr><p style = 'font-size: smaller'>This alert was generated by <a href = 'http://www.rbtdev.com'>Quaker for webOS</a></div>";
		var params = {
			summary : subject,
			text : body
		};
		this.$.launcher.call({id: "com.palm.app.email", params:params});
	},
	
	smsShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var msgText = "Quake Alert! " + this.activePin.title + " " + this.activePin.shareUrl;
		var params = {
			compose: {
				messageText : msgText
			}
		};
		this.$.launcher.call({id : "com.palm.app.messaging",params : params});	
	},

	gesturestartHandler: function(inSender, e) {
		//console.log("Gesture Start...");
		this.previousScale = e.scale;
		this.map.setOptions({disableUserInput: true});
	},
	gesturechangeHandler: function(inSender, e) {
		//console.log("Gesture Change...");
		var d = this.previousScale - e.scale;
		if (Math.abs(d) > 0.1) {
			var z = this.map.getZoom() + (d>0 ? -1 : +1);
			this.map.setView({zoom: z});
			this.previousScale = e.scale;
		}
	},
	gestureendHandler: function(inSender, e) {
		//console.log("Gesture End...");
		this.map.setOptions({disableUserInput: false});
	}

});
	
			