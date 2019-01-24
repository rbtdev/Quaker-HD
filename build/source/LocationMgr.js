//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

enyo.kind({
	name: "RBTDev.LocationManager",
	kind: enyo.Component,
	events: {
		onLocationUpdated: "",
		onLocationError: ""
		},
	components: [
		{name:"requestCurrentLocation" ,
			kind:"PalmService",
			service:"palm://com.palm.location/" ,
			method:"getCurrentPosition" ,
			parameters:{
				accuracy:1, 
				maximumAge:100,
				responseTime:1
			},
			onSuccess:"requestCurrentLocationSuccess",
			onFailure:"requestCurrentLocationFailed"
		}
	],
	
	create: function () {
		this.inherited(arguments);
		this.Miles = "Mi";
		this.Km = "Km";
		this.setUnits(this.Miles);
		this.latitude = null;
		this.longitude = null;
		this.locationAvailable = false;
	},
	
	setActive: function (active) {
		this.active = active;
	},
	
	setUnits: function (units) {
		this.units = units;	
		// Set up distance calculation parameters
		var Rm = 3959; // Radius of the Earth in miles
		var Rk = 6371; // Radius of the Earth in Km
		var R = Rm;
		switch (this.units) {
		case this.Miles:
			this.radius = Rm;
			break
		case this.Km:
			this.radius = Rk;
			break
		}
	},

	getCurrentLocation: function () {
		console.log("In getCurrentLocation");
		console.log("Calling locationServices request...");
		this.locationAvailable = false;
		if (this.active) {
			this.$.requestCurrentLocation.call();
		}
	},
	
	requestCurrentLocationSuccess: function (obj, location) {
		console.log("requestCurrentLocationSuccess - " + location.latitude + "," + location.longitude);
		this.gotPosition({latitude: location.latitude, longitude: location.longitude})
	},
	
	requestCurrentLocationFailed: function (obj, error) {
		var args = arguments;
		console.log("Location Error  - " + enyo.json.stringify(error.errorCode));
		var errorCode = error.errorCode;
		var errorString = "";
		switch (errorCode) {
			case 0:
				errorString = "Success";
				break;
			case 1:
				errorString = "Timeout"
				break;
			case 2: 
				errorString = "Position Unavailable";
				break;
			case 3: 
				errorString = "Unknown";
				break;
			case 5: 
				errorString = "Location Services are Off";
				break;
			case 6: 
				errorString = "Permission Denied - Check Location Services terms of use";
				break;
			case 7: 
				errorString = "The application already has a pending message";
				break;
			case 8: 
				errorString = "The application has been temporarily blacklisted";
				break;
		}
		console.log("sending errorCode:" + errorString);
		this.doLocationError(errorCode, errorString);
		//this.gotPosition({latitude: this.latitude, longitude: this.longitude});
	},

	gotPosition: function (location) {
		console.log("gotPosition - " + location.latitude + "," + location.longitude);
		if (location.latitude != this.latitude || location.longitude != this.longitude) {
			this.latitude = location.latitude;
			this.longitude = location.longitude;
			this.longitudeR = this.toRadians(this.longitude);
			this.latitudeR = this.toRadians(this.latitude);
			this.latitudeSin = Math.sin(this.latitudeR);
			this.latitudeCos = Math.cos(this.latitudeR);
			this.locationAvailable = true;
			console.log("Calling locationFoundCB");
			this.doLocationUpdated();
		}
		else {
			this.locationAvailable = true;
			console.log("Location unchanged");
		}
	},
	
	toRadians: function (deg) {
		return (deg*Math.PI / 180.0);
	},
	
	
	distanceTo: function (latitude, longitude) {
		var d = NaN;
		if (this.locationAvailable) {
			var latitudeRads = this.toRadians(latitude);
			var longitudeRads = this.toRadians(longitude);
			// Calculate distance using Law of Sines - should be accurate enough for
			// large distances
			var d = Math.round((Math.acos(this.latitudeSin * Math.sin(latitudeRads)
					+ this.latitudeCos * Math.cos(latitudeRads)
					* Math.cos(longitudeRads - this.longitudeR)) * this.radius));
			//console.log("distanceTo: " + latitude + "," + longitude + " = " + d);
		}
		return (d);
	}
});