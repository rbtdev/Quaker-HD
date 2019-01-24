//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

enyo.kind({
	name: "Quake",
	constructor: function(quakeXml) {
	
		this.eventTime = this.convertEventTime(quakeXml.getElementsByTagName("updated").item(0).textContent);
		var latLon = quakeXml.getElementsByTagNameNS("http://www.georss.org/georss", "point").item(0).textContent.split(" ");
		this.lat = parseFloat(latLon[0]);
		this.lon = parseFloat(latLon[1]);
		var depth = -parseFloat(quakeXml.getElementsByTagNameNS("http://www.georss.org/georss", "elev").item(0).textContent);
		var title = quakeXml.getElementsByTagName("title").item(0).textContent.split(",");
		this.magnitude = parseFloat(title[0].split(" ")[1]);
		this.locale = title[1];
		if (!this.locale) {
			this.locale = "";
		}
		this.region = title[2];
		if (!this.region) {
			this.region = "";
		}
		this.title = "M " + this.magnitude
		if (this.locale != "") {
			this.title = this.title + " - " + this.locale;
		}
		if (this.region != "") {
			this.title = this.title + " - " + this.region;
		}
		this.urn = quakeXml.getElementsByTagName("id").item(0).textContent;
		var urnElements = this.urn.split(":");
		this.source = urnElements[1];
		this.regionCode = urnElements[2];
		this.id = urnElements[3];
		this.links = [];
		var linkXml = quakeXml.getElementsByTagName("link");
		for (var i = 0; i< linkXml.length; i++) {
			this.links[i] = linkXml.item(i).getAttribute('href');
		}
		this.summary = quakeXml.getElementsByTagName("summary").item(0).textContent;
	},
	
	Months:	[ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec" ],
	Days:	["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	
	
	timeString: function () {
		var timeObj = this.eventTime;
		var eventTimeStr = this.Days[timeObj.getDay()] + " "
				+ this.Months[timeObj.getMonth()] + " "
				+ timeObj.getDate().toString() + ", "
				+ timeObj.getFullYear().toString() + " @"
				+ timeObj.toTimeString().substring(0, 8);
		return (eventTimeStr);
	},
	
	convertEventTime: function(eventTime) {

		// get date and time strings from date/time (yyyy-mm-ddThh:mm:ssZ)
		var eventDateTimeStr = eventTime.split("T");
		var eventDateStr = eventDateTimeStr[0];
		var eventTimeStr = eventDateTimeStr[1];

		// get mm, dd, and yyyy from yyyy-mm-dd
		
		var eventDateElements = eventDateStr.split("-");
		var eventYear = eventDateElements[0];
		var eventMonth = (parseInt(eventDateElements[1],10) - 1).toString();
		var eventDay = eventDateElements[2];

		// get hh, mm, ss from hh:mm:ss
		var eventTimeElements = eventTimeStr.split(":");
		var eventHours = eventTimeElements[0];
		var eventMins = eventTimeElements[1];
		var eventSecs = eventTimeElements[2].substring(0,eventTimeElements[2].length - 1);

		// Create a date object from the parsed date/time string
		return new Date(Date.UTC(eventYear, eventMonth, eventDay, eventHours,eventMins, eventSecs, 0));
	},

	images: function () {;
		var imageUrls = [];
		 imageUrls.push({
			order: 1, 
			info: "http://earthquake.usgs.gov/earthquakes/dyfi/events/" + this.regionCode + "/" + this.id + "/us/form.en.disabled.html",
			title: "Did You Feel It?", 
			url: "http://earthquake.usgs.gov/earthquakes/dyfi/events/" + this.regionCode + "/" + this.id + "/us/" + this.regionCode + this.id + "_ciim.jpg"
		});
		imageUrls.push({
			order: 10, 
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_m.html",
			title: "Historic Moment Tensor Solutions", 
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_m.jpg"
		});
		imageUrls.push({
			order: 2,
			info: "http://earthquake.usgs.gov/earthquakes/shakemap/global/shake/" + this.id,
			title: "Shake Map",
			url: "http://earthquake.usgs.gov/earthquakes/shakemap/global/shake/" + this.id + "/download/intensity.jpg"
		});
		imageUrls.push({
			order: 4,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_t.html",
			title: "Theoretical P-Wave Travel Times",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_tt.gif"
			});
		imageUrls.push({
			order: 3,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_w.html",
			title: "Seismic Hazard Map",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_w.jpg"
		});
		imageUrls.push({
			order: 5,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_d.html",
			title: "Earthquake Density (Shallow Earthquakes)",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_ed.gif"
		});
		imageUrls.push({
			order: 6,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_d.html",
			title: "Earthquake Density (All Depths)",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_ad.gif"
		});
		imageUrls.push({
			order: 7,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_h.html",
			title: "Historic Seismicity - Long Term",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_s.jpg"
		});
		imageUrls.push({
			order: 8,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_h.html",
			title: "Historic Seismicity - This Year",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_y.jpg"
		});
		imageUrls.push({
			order: 9,
			info: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_h.html",
			title: "Historic Seismicity - Large Earthquakes",
			url: "http://neic.usgs.gov/neis/bulletin/neic_" + this.id + "_7.jpg"
		});
		
		return imageUrls;
	},
	
	distance: function ()  {
		return enyo.application.locationManager.distanceTo(this.lat, this.lon);
	}
});

