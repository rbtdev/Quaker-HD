//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//


enyo.kind({
	name: "QuakeList",
	kind: enyo.Pane,
	events: {
		onNewItem:"",
		onUpdated:"",
		onListItemSelected:"",
		onListItemsClosed:""
	},
	components: [
		{name: "launcher",  
			kind: "PalmService",  
			service: "palm://com.palm.applicationManager/",  
			method: "open"
		},
		{name: "quakeFeed", kind: "QuakeFeed", onLoaded: "feedUpdated", onNewItem: "newQuake"},
		{kind: "VFlexBox", components: [	
			{name: "listHeader", kind: "PageHeader", className: "enyo-header-dark", align: "center", pack: "center", onclick: "openInfoPopup", components: [
				{name: "infoButton", kind: "Image", style: "position: absolute", src: "icons/tap-info.png"},
				{content: "Recent Earthquakes", className: "q_listTitle"}
			]},
			{name: "infoPopup", kind: "Popup", onBeforeOpen: "beforePopupOpen", onclick: "closeInfoPopup", components: [
				{name: "popupTitle", style: "font-size: medium; margin-bottom: 10px; font-weight: bold" , content: "List Info"},
				{kind: "VFlexBox", style: "font-size: medium; margin-bottom: 10px", components: [
					{name: "infoLastUpdate", content: "Last Update"},
					{name: "infoSortedBy", content: "Sorted by"},
					{name: "infoCount", content: "Number of quakes"}
				]}
			]},
			{flex:1, name: "list", kind: "VirtualList",  className: "list", onSetupRow: "listSetupRow", components: [
				{kind: "Item", pack: "center", layoutKind: "VFlexLayout", onclick: "listItemClick", components: [
					{layoutKind: "HFlexLayout", components: [
						{flex:1, align: "center",pack: "center", layoutKind: "VFlexLayout",  components: [
							{components: [
								{name: "magnitude", className: "q_magnitude"},
								{name: "depth", className: "q_depth"}
							]}
						]},
						{flex:4, align: "start",pack: "center", className: "q_description", layoutKind: "VFlexLayout", components: [
							{components: [
								{name: "eventTime", className: "q_time"},
								{name: "locale", className: "q_locale"},
								{name: "region", className: "q_region"}
							]}
						]},
						{flex:1.5, align: "end",pack: "center", layoutKind: "VFlexLayout", components: [
							{components: [
								{name: "distance", className: "q_distance"}
							]}
						]}
					]},
					{name: "drawer", animate: true, className: "q_drawer", kind: "enyo.BasicDrawer", caption: "Details", open: false, components: [
						{kind: "VFlexBox",  className: "q_details", align: "center", components: [
							{name: "summary", allowHtml: true, className: "q_summary"},
							{kind: "HFlexBox", className: "q_share", align: "center", components: [
								{name: "facebook", className: "facebook", content: "", onclick: "fbShare"},
								{name: "tweet", className: "twitter", content: "", onclick: "twShare"},
								{name: "email", className: "email", content: "", onclick :"emailShare"},
								{name: "sms", className: "sms", content: "", onclick: "smsShare"}
							]}
						]}
					]}
				]}
			]}
		]}
	],
	
	sortSmallest: 0,
	sortLargest: 1,
	sortClosest: 2,
	sortFarthest: 3,
	sortRecent: 4,
	sortNone: 5,
	
	sortSettingName: ["Smallest", "Largest", "Closest", "Farthest", "Recent", ""],
	
	create: function() {
		this.inherited(arguments);
		this.selectedRow = null;
		this.currentOpenDrawer = -1;
		this.useDrawers = false;
		this.setSort(this.sortRecent);
		
	},
	
	start: function (options) {
		//this.$.distanceUnits.setContent("(" + enyo.application.locationManager.units + ")");
		this.$.quakeFeed.start(options);
	},

	setRefresh: function (refreshTime) {
		this.$.quakeFeed.setRefresh(refreshTime) 
	},
	
	update: function () {
		this.$.quakeFeed.update();
		
	},

	
	feedUpdated: function (event, newQuakeCount) {
		this.lastUpdateTime = new Date();
		this.refreshList();
		//this.$.lastUpdate.setContent("Updated: " + new Date().format("m/d/yy HH:MM:ss"));
		this.doUpdated(newQuakeCount);
	},

	newQuake: function (event, index) {
		this.doNewItem(index);
	},
	
	refreshList: function () {
		this.sortQuakeList();
		this.moveOpenDrawer();		
		this.$.list.refresh();
	},
	
	moveOpenDrawer: function () {
		var openQuakeId
		// if there is an open drawer
		if (this.currentOpenDrawer > -1) {
			// find the row of the quake which is currently open
			var openQuakeIndex = this.findItemById(this.currentOpenQuakeId);
			// if it moved, then close it and open in the current position
			if (this.currentOpenDrawer != openQuakeIndex) {
				this.closeDrawer(this.currentOpenDrawer)
				this.openDrawer(openQuakeIndex);
			}
		}
	},
	
	beforePopupOpen: function () {
			this.$.infoLastUpdate.setContent("Last Update: " + this.timespan(new Date() - this.lastUpdateTime) + " ago");
			this.$.infoCount.setContent(this.length() + " quakes in the last 7 days.");
			this.$.infoSortedBy.setContent("Sorted by " + this.sortSettingName[this.sortSetting]);
	},
	closeInfoPopup: function () {
			this.$.infoPopup.close();
	},
	openInfoPopup: function () {
			this.$.infoPopup.openAtControl(this.$.listHeader, {top:35, left: 0});
	},
	
	listSetupRow: function(inSender, inRow) {
		var quake = this.$.quakeFeed.results[inRow];
		if (quake) {
			this.$.magnitude.setContent(quake.magnitude);
			var color = "red"; // red
			if (quake.magnitude < 7)color = "yellow" // yellow
			if (quake.magnitude < 5) color = "blue" // blue
			if (quake.magnitude < 3) color = "green" // green
			this.$.magnitude.setStyle("font-weight: bold; color: " + color);
			this.$.eventTime.setContent(this.timespan(new Date() - quake.eventTime) + " ago");
			this.$.region.setContent(quake.region);
			this.$.locale.setContent(quake.locale);
			//this.$.depth.setContent("(" + quake.depth + ")");
			var d = quake.distance();
			if (!isNaN(d)) {
			 this.$.distance.setContent(d + " "+ enyo.application.locationManager.units);
			}
			else {
			 this.$.distance.setContent("");
			}
			this.$.summary.setContent("Summary: " + quake.summary);
			return true;
		}
	},
	
	fbShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var quake  = this.$.quakeFeed.results[inEvent.rowIndex];
		var fbUrl = "http://facebook.com/sharer.php?u=" + escape(quake.links[0]);	
		console.log("launching browser: " + fbUrl);		
		this.$.launcher.call({id: "com.palm.app.browser", params:{target: fbUrl}});
	},
	
	twShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var quake  = this.$.quakeFeed.results[inEvent.rowIndex];
		var tweetText = escape("Magnitude - " + quake.magnitude + " #earthquake" + quake.locale.toUpperCase() + quake.region.toUpperCase() + " (source: @usgs)");
		var tweetUrl = "http://twitter.com/share?url=" + escape(quake.links[0]) + "&text=" + tweetText + "&via=Quaker_webOS";
		console.log("launching browser: " + tweetUrl);		
		this.$.launcher.call({id: "com.palm.app.browser", params:{target: tweetUrl}});
	},
	
	emailShare: function (inSender, inEvent) {
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
		  inEvent.stopPropagation();
		}
		var quake  = this.$.quakeFeed.results[inEvent.rowIndex];
		var subject = "Magnitude " + quake.magnitude
				+ " Earthquake - " + quake.locale + "," + quake.region;
		var body = "<p>&nbsp</p><p>&nbsp</p>"
				+ "<p>Magnitude " + quake.magnitude +" Earthquake - " + quake.locale + " " + quake.region + "</p>"
				+ "<p>" + quake.summary + "</p>"
				+ "<div style='clear:both; margin-top: 75px;'>For more information go to: <a href = '"
				+ quake.links[0]
				+ "'>"
				+ quake.links[0]
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
		var quake  = this.$.quakeFeed.results[inEvent.rowIndex];
		var msgText = "Quake Alert! " + quake.title + " " + quake.links[0];
		var params = {
			compose: {
				messageText : msgText
			}
		};
		this.$.launcher.call({id : "com.palm.app.messaging",params : params});	
	},	
	
	
	
	pinIndex: function (index) {
		return (this.$.quakeFeed.results[index].pinIndex);
	},
	
	length: function () {
		return (this.$.quakeFeed.results.length);
	},
	
	mapPin: function (listIndex, pinIndex) {
		this.$.quakeFeed.results[listIndex].pinIndex = pinIndex;
	},
	
	findPin: function (pinIndex) {
		for (var quakeIndex = 0; quakeIndex < this.$.quakeFeed.results.length; quakeIndex++) {
			if (this.$.quakeFeed.results[quakeIndex].pinIndex == pinIndex) {
				return(quakeIndex);
			}
		}
		return (-1);	
	},
	
	getPin: function (index) {
		return (this.$.quakeFeed.results[index].pinIndex);
	},
	
	getMagnitude: function (index) {
		return (this.$.quakeFeed.results[index].magnitude);
	
	},
	
	getSummary: function(index) {
		return (this.$.quakeFeed.results[index].summary);
	},
	
	getLocation: function (listIndex) {
		return ({lat: this.$.quakeFeed.results[listIndex].lat, lon: this.$.quakeFeed.results[listIndex].lon});
	},
	
	getTitle: function (listIndex) {
		//console.log("Calling getTitle...");
		return this.$.quakeFeed.results[listIndex].title;
	},
	
	getQuakeId: function (listIndex) {
		//console.log("Calling getId...");
		return this.$.quakeFeed.results[listIndex].id;
	},
	
	getImages: function (index) {
		return this.$.quakeFeed.results[index].images();	
	},
	
	getUrl: function (index) {
		return this.$.quakeFeed.results[index].links[0];
	},
	
	isNewItem: function (index) {
		return this.$.quakeFeed.results[index].newItem;
	},
	
	setNewItem: function (index, value) {
		this.$.quakeFeed.results[index].newItem = value;
	},
	
	listItemClick: function(inSender, inEvent) {
	
		inEvent.cancelBubble = true;
		if (inEvent.stopPropagation) {
			inEvent.stopPropagation();
		}
		var thisRowIndex = inEvent.rowIndex;
		this.selectItem(thisRowIndex);

	},
	
	findItemById: function (id) {
		for (var quakeIndex = 0; quakeIndex < this.$.quakeFeed.results.length; quakeIndex++) {
			if (this.$.quakeFeed.results[quakeIndex].id == id ) {
				return(quakeIndex);
			}
		}
		return (-1);	
	
	},
	
	selectItemById: function (id) {
		var quakeIndex = this.findItemById(id)
		if (quakeIndex != -1) {
			this.selectItem(quakeIndex);
		}
		return (quakeIndex);
	},
	
	selectItem: function (index) {
		
		console.log("Item: " + index + " selected...");
		var openDrawer = this.currentOpenDrawer;
		this.closeDrawer(openDrawer);
		if (index != openDrawer) {
			this.openDrawer(index);
		}
		
		if (this.currentOpenDrawer == -1 && this.useDrawers) {
			this.doListItemsClosed();
		}
		else {
			this.doListItemSelected(index);
		}
	},
	
	
	closeDrawer: function (index) {
		if (index > -1) {
			console.log("Closing row " + index);
			this.$.list.prepareRow(index);
			this.$.drawer.animate = true;
			this.$.drawer.setOpen(false);
			this.currentOpenDrawer = -1;
			this.currentOpenQuakeId = -1;
		}
	},
	
	openDrawer: function (index) {
		if (index > -1 && index < this.$.quakeFeed.results.length && this.useDrawers) {
			console.log("Opening row " + index);
			this.$.list.prepareRow(index);
			this.$.drawer.animate = true;
			this.$.drawer.setOpen(true);
			this.currentOpenDrawer = index;
			this.currentOpenQuakeId = this.$.quakeFeed.results[index].id;
		}
	},
	
	
	timespan: function(timeSpan) {
		var dhms = "";
		var dtm = new Date();
		dtm.setTime(timeSpan);
		var d = Math.floor(timeSpan / (3600000 * 24));
		var h = Math.floor(timeSpan / 3600000) % 24;
		var m = dtm.getMinutes();
		var s = Math.round(dtm.getSeconds());

		var dstr = "";
		var hstr = "";
		var mstr = "";
		var sstr = "";
		if (d != 0) {
			dstr = d.toString() + "d ";
		}
		if (h != 0) {
			hstr = h.toString() + "h ";
		}
		if (m != 0) {
			mstr = m.toString() + "m ";
		}
		if (s != 0) {
			sstr = s.toString() + "s ";
		}

		hms = dstr.substr(d.length - 3) + hstr.substr(h.length - 2)
				+ mstr.substr(m.length - 2) + sstr.substr(s.length - 2);
		return hms;
	},
	setSort: function (sortSetting) {
		this.sortSetting = sortSetting;
		//this.$.sortFlag.setContent("Sort: " + this.sortSettingName[sortSetting]);
	},
	
	
	sortQuakeList: function() {
		switch (this.sortSetting) {
		case this.sortNone:
			break;
		case this.sortSmallest:
			this.$.quakeFeed.results.sort(this.sortByMagnitudeIncreasing);
			break;
		case this.sortLargest:
			this.$.quakeFeed.results.sort(this.sortByMagnitudeDecreasing);
			break;
		case this.sortClosest:
			this.$.quakeFeed.results.sort(this.sortByDistanceIncreasing);
			break;
		case this.sortFarthest:
			this.$.quakeFeed.results.sort(this.sortByDistanceDecreasing);
			break;
		case this.sortRecent:
			this.$.quakeFeed.results.sort(this.sortByTimeIncreasing);
			break;
		}
	},
	
	sortByTimeIncreasing: function(a, b) {
		var x = a.eventTime;
		var y = b.eventTime;
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	},

	sortByMagnitudeIncreasing: function(a, b) {
		var x = a.magnitude;
		var y = b.magnitude;
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	},

	sortByMagnitudeDecreasing: function(a, b) {
		var x = a.magnitude;
		var y = b.magnitude;
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	},

	sortByDistanceIncreasing: function(a, b) {
		var x = a.distance();
		var y = b.distance();
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	},

	sortByDistanceDecreasing: function(a, b) {
		var x = a.distance();
		var y = b.distance();
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	}
	
});
	