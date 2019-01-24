//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

enyo.kind({
	name: "QuakeFeed",
	kind: enyo.Component,
	events: {
		onNewItem:"",
		onLoaded:""
	},
	components: [
		{name: "quakeFeed", kind: "WebService", handleAs: "xml", onSuccess: "gotFeed", onFailure: "gotFeedFailure"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.results = [];
		this.lastQuakeId = "";
		this.newQuakes = false;
		this.url="http://earthquake.usgs.gov/earthquakes/catalogs/7day-M2.5.xml";
		this.$.quakeFeed.setUrl(this.url);
		
		// Chrome Test Feeder
		//this.testFeed = new XMLTestFeed();
	},
	
	start: function (options) {
		this.refreshTime = options.refresh;
		this.alertMagnitude = options.alertOptions.magnitude;
		this.update();
	},
	
	setRefresh: function (refreshTime) {
		this.refreshTime = refreshTime;
		clearTimeout(this.updateTimer);
		if (this.refreshTime > 0) {
			this.updateTimer = setTimeout(this.update.bind(this), this.refreshTime);
		}
	},
	
	update: function () {
		clearTimeout(this.updateTimer);
		// run in emulator
		this.newQuakeCount = 0;
		this.$.quakeFeed.call();
	
		//run in chrome
		// var parser=new DOMParser();
		// var feedData = this.testFeed.getData();
		// var xmlDoc=parser.parseFromString(feedData,"text/xml");
		// this.gotFeed("", xmlDoc);
		
		if (this.refreshTime >0) {
			this.updateTimer = setTimeout(this.update.bind(this), this.refreshTime);
		}
	},
	
	
	gotFeed: function(inSender, inResponse) {
		console.log("Got Feed");
		var firstTime = (this.results.length == 0);
		this.results = [];
		this.results = this.makeQuakes(inResponse);
		this.checkNewQuakes(firstTime);
		this.doLoaded(this.newQuakeCount);
	},
	
	checkNewQuakes: function (firstTime)	{

		if (this.results.length > 0) {
			if (!firstTime) {
				var check = true;
				var i = 0;
				while (check) {
					if (this.results[i].id != this.lastQuakeId) { 
						this.doNewItem(i);
						this.newQuakeCount++;
					}
					else {
						check = false;
					}	
					i++;
					if (i >= this.results.length) {
						check = false;
					}
				}
			}
			this.lastQuakeId = this.results[0].id;
		}
	},
	
	gotFeedFailure: function(inSender, inResponse) {
		console.log("got failure from getFeed");
	},
	
	makeQuakes: function (xmlDoc) {
		var quakes = [];
		if (xmlDoc) {
			var quakeXml = xmlDoc.getElementsByTagName("entry");
			for (var i = 0; i<quakeXml.length; i++) {
				quakes[i] = new Quake(quakeXml[i]);
			}
		}
		return quakes;
	}
});
