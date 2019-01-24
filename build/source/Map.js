enyo.kind({
	name: "Map",
	constructor: function(canvas, key, center) {
		this.map = null;
		this.pinSelectedPin = null;
		this.canvas = canvas;
		this.redPinIcon = "icons/pin_red.png";
		this.greenPinIcon = "icons/pin_green.png";
		this.activePinIcon = "icons/pin_active.gif";
		this.homePinIcon = "icons/pin_home.png";
		this.pushPins = [];
		this.mapCenter = new google.maps.LatLng(center.lat, center.long);
	},
	
	load: function () {
		if (!this.map) {	
			var myOptions = {
				center: this.mapCenter,
				zoom: 2,
				mapTypeId: google.maps.MapTypeId.HYBRID
			};
			this.map = new google.maps.Map(this.canvas, myOptions);						
		}
		else {
		//	this.map.panTo(this.mapCenter);
		//	this.map.setZoom(2);
		}
	},
	
	zoomOut: function () {
		this.deactivatePin(this.selectedPin);
		//this.map.panTo(this.mapCenter);
		//this.map.setZoom(2);
	},
	
	zoomTo: function (pinIndex) {
		if (this.selectedPin != pinIndex)
		{
			this.deactivatePin(this.selectedPin);
			var pin = this.pushPins[pinIndex];
			//var latlng = pin.getPosition();	
			//handlerId = google.maps.events.addListenerOnce(this.map, 'center_changed', 
			//	function () {
			//		this.activatePin(pinIndex);
			//	}.bind(this));
									
			//this.map.panTo(latlng);
			//this.map.setZoom(5);
		}
	},
	
	clearPins: function() {
		this.pushPins = [];
	},
	
	addHome: function (latitude, longitude) {
	
		this.pushPins.push(new google.maps.Marker({
				position: new google.maps.LatLng(latitude, longitude),
				map: this.map,
				draggable: false,
				animation: google.maps.Animation.DROP
		}));	
	},
	
	addPin: function (latitude, longitude, size) {
		//this.createCircle(latitude, longitude, size);
			this.pushPins.push(new google.maps.Marker({
				position: new google.maps.LatLng(latitude, longitude),
				map: this.map,
				draggable: false,
				animation: google.maps.Animation.DROP
			}));	
	},
	
	deactivatePin: function (pinIndex) {
		var pin = this.pushPins[pinIndex];
		if (pin) {
			pin.setOptions({zIndex:0});
		}
		this.selectedPin = null;
	},
	
	activatePin: function (pinIndex) {
		var pin = this.pushPins[pinIndex];
		if (pin) {
			pin.setOptions({zIndex:999});
		}
		this.selectedPin = pinIndex;
	},
	
	toRadians: function (deg) {
		return (deg*Math.PI / 180.0);
	},
	
	toDegrees: function (rads) {
		return (rads*180.0/Math.PI);
	}
	
	
/*
	createCircle: function(latitude, longitude, radius) {
   
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
		var polygoncolor = new Microsoft.Maps.Color(100,255,0,0);
		var strokeColor = new Microsoft.Maps.Color(255,0,0,0);
		var polygon = new Microsoft.Maps.Polygon(locs,{fillColor: polygoncolor, strokeColor: strokeColor, strokeThickness: 1});

					// Add the shape to the map
		this.map.entities.push(polygon);
	}
*/
});
	
			