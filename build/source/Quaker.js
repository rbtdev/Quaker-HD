//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//
enyo.kind({
	name: "Quaker",
	kind: enyo.VFlexBox,	
	components: [
		{flex:1, name: "appPane", kind: "Pane", components: [
			{name: "mainView", kind: "VFlexBox", components: [
				{name: "slidingPane", kind:  "SlidingPane", flex: 1, canAnimate:false, components: [
					{name: "listPanel",	width: "320px",	kind:"SlidingView", components: [
						{flex: 1,name:"quakeList", kind: "QuakeList", onListItemsClosed: "quakeListClosed", onUpdated: "listUpdated", onNewItem: "notifyNewQuake", onListItemSelected: "listItemSelected"},
						{kind: "Toolbar", pack: "justify", components: [
							{kind: "ToolButtonGroup", components: [
								{name: "sortButton", icon: "icons/list-view-icon.png", onclick: "sortMenuClick"}
								//{name: "filterButton", icon: "icons/filter-icon.png", disabled: false}
							]},
							{name: "spinner", kind: "Spinner"},
							//{name: "simQuake", kind: "Button", caption:"NewQuake", onclick: "simulateNewQuake"},
							{kind: "IconButton", icon: "icons/toolbar-icon-sync.png", onclick: "refreshQuakes"}
						]},
						{name: "sortMenu", kind: "Menu", components: [
							{name: "sortMostRecent", checked: true, caption: "Most Recent", onclick: "doSort"},
							{name: "sortClosest", caption: "Closest",  onclick: "doSort"},
							{name: "sortFarthest", caption: "Farthest", onclick: "doSort"},
							{name: "sortLargest", caption: "Largest",  onclick: "doSort"},
							{name: "sortSmallest", caption: "Smallest", onclick: "doSort"}
						]}
					]},
					{name: "viewPanel",	kind:"SlidingView",	flex: 1, dragAnywhere:false, onResize: "viewResized", components: [
						{flex:1, name: "viewPane", className: "viewPane", kind: "Pane", components: [
							{name: "loadingView", kind: "VFlexBox", align: "center", style: "color:black", pack: "center", components: [
								{name: "loadingMessage", content: ""},
								{name: "loadingSpinner", kind: "SpinnerLarge"}
							]},
							{flex:1, name: "mapView", kind: "Map", className: "mapCanvas", key: "AkISCYsPW8NmwIiKK3VEGAdGX0Udl-n5RvTt8tmWNJjWCf3OYlvuYt_DPO6VHhVh",
				zoom: 2, center: {lat:0,long:-150}, onLoaded: "mapLoaded", onPinClick: "pinClick"},
							{kind: "Scroller", className: "webView", name: "webView", components: [
								{name: "webViewBrowser", kind: "WebView", url: "http://earthquake.usgs.gov", onPageTitleChanged: "setWebNavButtons"}
								//{name: "webViewBrowser", kind: "WebView", url: ""}
							]},
							{name: "imageViewer", kind: "ImageViewer", onLoaded: "imagesLoaded", onShow: "imageViewSelected"},
							{name: "dataErrorView", kind: "VFlexBox", align: "center", pack: "center", components: [
								{kind: "Image", src: "icons/no-internet.png", style: "margin-bottom:20px"},
								{content: "No Data Connection Available."},
								{content: "Please Check Device Settings and Restart Quaker HD"}
							]}
						]},
						{name: "viewMenu", kind: "Toolbar", components: [
							{kind: "GrabButton", name:"grabButton"},
							{kind: "Spacer"},
							{kind: "RadioToolButtonGroup", value: "road", name: "mapTypeButtonGroup", onChange: "setMapType", components: [
								{name: "mapRoadButton", value:  "road", icon: "icons/map-type-road.png"},
								{name: "mapSatelliteButton", value: "aerial", icon: "icons/map-type-satellite.png"}
							]},
							{kind: "ToolButtonGroup", components: [
								{name: "webBackButton", icon: "icons/menu-icon-back.png", onclick:  "webViewBack",  disabled: true},
								{name: "webFwdButton", icon: "icons/menu-icon-forward.png", onclick:  "webViewFwd",  disabled: true}
								//{name: "back", caption: "Back", onclick: "webViewBack", disabled: true},
								//{name: "forward", caption: "Forward", onclick: "webViewFwd", disabled: true}
							]},
							{kind: "Spacer"},
							{kind: "Spacer", name: "mapViewSpacer1"},
							{name: "mapZoomButtonGroup", value: 2, kind: "RadioToolButtonGroup", onChange: "setMapZoom", components: [
								{name: "mapZoomOutButton", value: 2,  icon: "icons/minus.png"},
								{name: "mapZoomInButton", value: 10, icon: "icons/plus.png"},
							]},
							{kind: "Spacer", name: "mapViewSpacer2"},
							{kind: "RadioToolButtonGroup", name: "viewButtonGroup", components: [
								//{name: "preferencesViewButton", caption: "Prefs", onclick: "displayPreferencesView"},
								//{name: "mapViewButton",  caption: "Map", onclick: "displayMapView"},
								{name: "mapViewButton",  icon: "icons/menu-icon-info.png", onclick: "displayMapView"},
								{name: "webViewButton",  icon: "icons/link-icon.png", onclick: "displayWebView"},
								{name: "imageViewButton",  icon:"icons/menu-icon-fp-image.png", className: "imageButton", disabled: true, onclick: "displayImageView"}
							]} 
						]}
					]}
				]}
			]},
			{name: "preferencesView", kind: "Preferences", onChanged: "preferencesChanged"},
			{name: "helpView", kind: "Help", onDone: "helpDone"}
		]},
		{name:"dashboard", kind: "Dashboard", onTap: "dashboardTap"},
		{name:"errorDashboard", kind: "Dashboard", onTap: "errorDashboardTap"},
		{name:"locationManager", kind:"RBTDev.LocationManager", onLocationUpdated: "locationUpdated", onLocationError: "locationError"},
		{name:"connectionStatus", kind:"PalmService",
			service:"palm://com.palm.connectionmanager" ,
			method:"getStatus" ,
			parameters:{},
			onSuccess:"connectionStatusSuccess",
			onFailure:"connectionStatusFailed"},	
		{kind: "AppMenu", components: [
			{caption: "Preferences", onclick: "displayPreferencesView"},
			{caption: "Help", onclick: "displayHelpView"}
		]},
		{kind: "ApplicationEvents", onApplicationRelaunch: "appRelaunched", onWindowRotated: "windowRotated"}		
	],

	create: function() {
		console.log("Creating Quaker...");
		this.inherited(arguments);
		this.imageUrls = [];
		this.mapIsLoaded = false;
		this.listIsUpdated = false;
		this.addingPins = false;
		this.webViewHome = "http://earthquake.usgs.gov";
		this.setWindowOrientation(enyo.getWindowOrientation());
		this.simQuakeIndex = 0;
		this.loggedMetrix = false;
		//this.webViewHome = "";
	},
	
	showSpinner: function(inShowing) {
		this.$.spinner.setShowing(inShowing);
	},
	
	rendered: function () {
		this.inherited(arguments);
		console.log("***Quaker Rendered***");
		this.showLoading("Initializing Quaker HD");
		enyo.application.locationManager = this.$.locationManager;
		this.$.connectionStatus.call();
	},
	
	showLoading: function(message) {
		this.$.loadingMessage.setContent(message);
		this.$.loadingSpinner.setShowing(true);
		this.$.viewPane.selectView(this.$.loadingView);
	},
	
	connectionStatusSuccess: function(obj,response) {
		console.log("Connection Status request successful");
		if (!response.isInternetConnectionAvailable) {
			enyo.windows.addBannerMessage("No Data Connection Available","{'error':'No Data Connection Available'}", "./icons/earthquake.png");
			this.displayDataErrorView();
		}
		else {
			this.initialize();
			this.start();
		}
	},
	
	connectionStatusFailure: function(obj,response) {
		console.log("Connection Status request failed - " + response.errorText);
		enyo.windows.addBannerMessage(response.errorText,"{'error':'" + response.errorCode + "'}", "./icons/earthquake.png");
		this.displayDataErrorView();

	},
	
	setWindowOrientation: function (orientation) {
		//this.$.slidingPane.canAnimate = false;
		if (orientation == "up" || orientation == "down") {
		   /** do stuff for landscape **/
			console.log("Window orientation = landscape");
			this.$.slidingPane.selectView(this.$.listPanel);
			this.$.grabButton.slidingHandler = true;
			this.$.grabButton.show();
		} else {
		   /** do stuff for portrait **/
			console.log("Window orientation = portrait");
			this.$.slidingPane.selectView(this.$.viewPanel);
			this.$.grabButton.slidingHandler = false;
			this.$.grabButton.hide();
		}
		//this.$.slidingPane.canAnimate = true;
	},
	
	windowRotated: function (sender, event) {
		console.log("Window Rotated: " + event.orientation);
		this.setWindowOrientation(event.orientation);
	},
	
	appRelaunched: function (sender, event) {
		console.log("Application Relaunched...");
	
	},

	preferencesChanged: function () {	
		console.log("Preferences Changed...");
		this.start();
	},
	
	helpDone: function () {
		this.$.appPane.selectView(this.$.mainView);
	},
	
	initialize: function () {
		this.$.quakeList.setSort(this.$.quakeList.sortRecent);
		this.$.mapView.load();
	},
	
	start: function() {		
		console.log("Starting list...");
		//this.$.loadingSpinner.setShowing(false);
		this.$.appPane.selectView(this.$.mainView);
		var preferences = this.$.preferencesView.getPreferences();
		this.preferences = 	{
			refreshMins: preferences.refreshTime,
			units: preferences.distanceUnits,
			defaultView: preferences.defaultView,
			autoselect: preferences.autoselect,
			autolocate: preferences.autolocate,
			usemetrix: true,
			alerts: {
				magnitude: 2,
				distance: 1000
			}
		};	
		this.displayView(this.preferences.defaultView);
		if (this.preferences.usemetrix && !this.loggedMetrix) {
			this.loggedMetrix = true;
			console.log("Using Metrix for annonymous usage stats, and bulletins");
			enyo.application.metrix = new Metrix(); //Instantiate Metrix Library
			enyo.application.metrix.postDeviceData();
			//enyo.application.metrix.checkBulletinBoard(1, false);
		}
		enyo.application.locationManager.setActive(this.preferences.autolocate);
		enyo.application.locationManager.setUnits(this.preferences.units);
		var options = 	{	refresh:1000*60*this.preferences.refreshMins, 
							alertOptions: this.preferences.alerts
						};
		this.$.quakeList.start(options);
		
		this.showSpinner(true);
	},

	refreshQuakes: function() {
		this.showSpinner(true);
		this.$.quakeList.update();
	},
	
	quakeListClosed: function () {
		this.displayView(this.preferences.defaultView);
		this.$.webViewBrowser.clearHistory();
		this.$.webViewBrowser.setUrl(this.webViewHome);
		this.$.mapView.zoomOut();
		this.$.imageViewButton.disabled = true;
		this.$.imageViewButton.disabledChanged();
	},
	
	locationUpdated: function () {
		this.$.quakeList.refreshList();
		//this.$.mapView.moveTo( 0, enyo.application.locationManager.longitude);
		this.addHomePin();
	},
	
	locationError: function (obj, errorCode, errorString) {
		console.log("Location Error: " + errorString);
		if (this.$.errorDashboard.layers.length == 0) {
			enyo.windows.addBannerMessage(errorString,"{'error':'" + errorString + "'}", "./icons/earthquake.png");
			this.$.errorDashboard.layers.push({title:"Location Error - Check Settings", text:errorString, icon: "./icons/earthquake.png"});
			this.$.errorDashboard.updateWindow();
		}
	},

	listUpdated: function (event, newQuakeCount) {
		console.log("List Updated : " + newQuakeCount + " quakes");
		if (newQuakeCount > 0) {
			var quake = "Earthquake";
			if (newQuakeCount > 1) {
				quake = "Earthquakes";
			}
			enyo.windows.addBannerMessage(newQuakeCount + " New " + quake, "{'count':" + newQuakeCount + "}", "./icons/earthquake.png");
		}
		this.showSpinner(false);
		enyo.application.locationManager.getCurrentLocation();
		this.listIsUpdated = true;
		this.updateMap();
	},
	
	mapLoaded: function () {
		console.log("Map Loaded - adding map pins");
		this.mapIsLoaded = true;
		this.updateMap();
	},


	updateMap: function () {
		if (this.mapIsLoaded && this.listIsUpdated && !this.addingPins) {
			this.addingPins = true;
			console.log("Adding map pins. Count = " + this.$.quakeList.length());
			this.$.mapView.clearPins();
			for (var i = 0; i< this.$.quakeList.length(); i++) {
				var quakeLocation = this.$.quakeList.getLocation(i);
				this.$.mapView.addPin({latitude:quakeLocation.lat,
										longitude:quakeLocation.lon, 
										id:this.$.quakeList.getQuakeId(i),
										magnitude:this.$.quakeList.getMagnitude(i),
										title:this.$.quakeList.getTitle(i), 
										description:this.$.quakeList.getSummary(i),
										shareUrl:this.$.quakeList.getUrl(i)});
				this.$.quakeList.mapPin(i,i);
			}
			// now that pins are loaded auto select first item if set
			if (this.preferences.autoselect) {
				this.$.quakeList.selectItem(0);
			}
			this.listIsUpdated = false;
			this.addingPins = false;
		}
	},
	
	setWebNavButtons: function (sender, title, url, back, fwd) {
			console.log("Title: " + title);
			console.log("URL: " + url);
			console.log("back:" + back);
			console.log("fwd:" + fwd);
			this.$.webView.resized();
			this.$.webBackButton.disabled = !back;
			this.$.webBackButton.disabledChanged();
			this.$.webFwdButton.disabled = !fwd;
			this.$.webFwdButton.disabledChanged();
	},
	
	webViewBack: function () {
		this.$.webViewBrowser.goBack();
	},
	
	webViewFwd: function() {
		this.$.webViewBrowser.goForward();
	},
	
	errorDashboardTap: function (event, layer) {
		console.log("Error Dashboard Tapped");
		event.cancelBubble = true;
		if (event.stopPropagation) {
		  event.stopPropagation();
		}
		this.$.errorDashboard.pop();
		//this.$.errorDashboard.updateWindow();
	},
	
	dashboardTap: function (event, layer) {
		event.cancelBubble = true;
		if (event.stopPropagation) {
		  event.stopPropagation();
		}
		this.$.appPane.selectView(this.$.mainView);
		enyo.windows.activateWindow(enyo.windows.getRootWindow());
		this.$.dashboard.pop();
		var id = layer.eventId;
		console.log("Layer index = " + layer.eventIndex);
		this.$.quakeList.selectItemById(id); 
	},
	
	imageViewSelected: function () {
		this.$.imageViewer.displayImages();
	},
	
	displayView: function (viewName) {
		console.log("displayView - " + viewName);
		var activeButton = null;
		var activeView = null;
		var webButtons = false;
		var mapButtons = false;
		switch (viewName) {
			case "web":
				activeView = this.$.webView;	
				activeButton = this.$.webViewButton;
				mapButtons = false;
				webButtons = true;
				this.showLoading("");
			break;
			case "map":
				activeView = this.$.mapView;
				activeButton = this.$.mapViewButton;
				mapButtons = true;
				webButtons = false;
			break;
			case "image":
				activeView = this.$.imageViewer;
				activeButton = this.$.imageViewButton
				mapButtons = false;
				webButtons = false;
			break;
		}
		if (activeButton && activeView) {
			this.$.viewPane.selectView(activeView);
			if (activeView == this.$.mapView) {
				this.$.quakeList.useDrawers = false;
			}
			else {
				this.$.quakeList.useDrawers = true;
			}

			this.$.imageViewButton.depressed = false;
			this.$.webViewButton.depressed = false;
			this.$.mapViewButton.depressed = false;
			activeButton.depressed = true;
			
			this.$.imageViewButton.depressedChanged();
			this.$.webViewButton.depressedChanged();
			this.$.mapViewButton.depressedChanged();
			
			this.$.viewButtonGroup.value = activeButton.getValue();
			this.$.viewButtonGroup.valueChanged();
			
			if (webButtons) {
				this.showWebButtons(true);
			}
			else {
				this.showWebButtons(false);
			}
			
			if (mapButtons) {
				this.showMapButtons(true);
			}
			else {
				this.showMapButtons(false);
			}
		}
	},
		
	displayHelpView: function ()
	{
		this.$.appPane.selectView(this.$.helpView);
	},		
	
	displayPreferencesView: function ()
	{
		this.$.appPane.selectView(this.$.preferencesView);
	},	

	displayDataErrorView: function () {
		this.$.viewPane.selectView(this.$.dataErrorView);
	},
	
	displayMapView: function ()
	{
		this.displayView("map");
	},
	
	displayWebView: function ()
	{	
		this.displayView("web");
	},
	
	displayImageView: function () 
	{
		this.displayView("image");
	},
	
	showWebButtons: function (visible) {
		if (visible) {
			this.$.webBackButton.show();
			this.$.webFwdButton.show();
		}
		else {
			this.$.webBackButton.hide();
			this.$.webFwdButton.hide();
		}
	},
	
	showMapButtons: function (visible) {
		if (visible) {
			this.$.mapViewSpacer1.hide();
			//this.$.mapViewSpacer2.hide();
			this.$.mapTypeButtonGroup.show();
			this.$.mapZoomButtonGroup.show();
		}
		else {
			this.$.mapViewSpacer1.show();
			//this.$.mapViewSpacer2.show();
			this.$.mapTypeButtonGroup.hide();
			this.$.mapZoomButtonGroup.hide();
		}
	},
	
	setMapType: function (sender) {
		console.log("setMapType: Selected button " + sender.getValue());
		this.$.mapView.setMapType(sender.getValue());
	},
	
	setMapZoom: function (sender) {
		console.log("Set Map Zoom: " + sender.value);
		this.$.mapView.setZoom(sender.value);
	},
	
	
	viewResized: function () {
		this.$.viewPanel.resized();
	},
	
	addHomePin: function () {
		console.log("addHomePin...")
		if (this.mapIsLoaded && enyo.application.locationManager.locationAvailable) {
			console.log("adding home pin...");
			this.$.mapView.addHome(enyo.application.locationManager.latitude, enyo.application.locationManager.longitude); 	
		}
	},
	

/* 	FOR TESTING IN CHROME - Banners dont work
	newQuakes: function (event, index) {
		//this.newQuakeIndex = index;
		//enyo.windows.addBannerMessage(this.$.quakeList.getTitle(index), "{'index':" + index + "}", "./icons/earthquake.png");
		//this.$.dashboard.layers.push({title:this.$.quakeList.getTitle(index), text: this.$.quakeList.getQuakeId(index), icon: "./icons/earthquake.png"});
		//this.$.dashboard.updateWindow();
	},
	 */
	
	simulateNewQuake: function () {
		this.notifyNewQuake(null, this.simQuakeIndex++);	
	},
	
	notifyNewQuake: function (event, index) {
		this.$.dashboard.layers.push({title:this.$.quakeList.getTitle(index), eventId:this.$.quakeList.getQuakeId(index), text:"Tap to view with Quaker HD", icon: "./icons/earthquake.png"});
		this.$.dashboard.updateWindow();
	},
	
	pinClick: function (event, id) {
		this.$.quakeList.selectItemById(id)
	},
	
	selectItem: function (index) {
		console.log("selectItem: " + index);
		this.$.mapView.zoomTo(this.$.quakeList.pinIndex(index), (this.$.viewPane.getViewName() == "mapView"));
		this.$.mapZoomButtonGroup.setValue(-1);
		this.$.imageViewer.loadImages(this.$.quakeList.getTitle(index), this.$.quakeList.getImages(index));
		this.$.webViewBrowser.clearHistory();
		this.$.webViewBrowser.setUrl(this.$.quakeList.getUrl(index));
		this.checkDashBoard(index);
	},
	
	checkDashBoard: function (index) {
		console.log("Checking Dashboard for index = " + index);
		var layers = this.$.dashboard.layers;
		var newLayers = [];
		var id = this.$.quakeList.getQuakeId(index);
		for (var i=0;(i<layers.length); i++) {
			console.log("layer[" + i + "].id = " + layers[i].eventId + "  id = " + id);
			if (layers[i].eventId != id) 
			{
				console.log("CheckDashBoard: adding layer to newLayers: index = " + index);
				newLayers.push(layers[i]);
			}
			else {
				console.log("CheckDashboard: found index: " + index);
			}
		}
		this.$.dashboard.setLayers(newLayers);
		this.$.dashboard.updateWindow();
	},
	
	listItemSelected: function(event, index) {		
		console.log("Got listItemSelected event for index: " + index);
		this.selectItem(index);
	},
	
	imagesLoaded: function (event, count) {
		console.log("Image Count = " + count);
		if (this.$.viewPane.view.name == this.$.imageViewer.name) {
			this.$.imageViewer.displayImages();
		}
		
		if (count > 0) {
			this.$.imageViewButton.disabled = false;
		}
		else {
			this.$.imageViewButton.disabled = true;
		}
		this.$.imageViewButton.disabledChanged();
	},
	
	sortMenuClick: function(inSender) {
		this.$.sortMenu.openAtControl(this.$.sortButton, {bottom:0});
	},
	
	doSort: function (sender, event) {
		console.log("Sort: sender = " + sender.name);
		var sortValue = this.$.quakeList.sortNone;
		switch (sender) {
			case this.$.sortMostRecent:
				sortValue = this.$.quakeList.sortRecent;
				break;
			case this.$.sortClosest:
				sortValue = this.$.quakeList.sortClosest;
				break;
			case this.$.sortFarthest:
				sortValue = this.$.quakeList.sortFarthest;
				break;
			case this.$.sortLargest:
				sortValue = this.$.quakeList.sortLargest;
				break;
			case this.$.sortSmallest:
				sortValue = this.$.quakeList.sortSmallest;
				break;
		}
		this.$.quakeList.setSort(sortValue);
		this.$.quakeList.refreshList();
		this.listIsUpdated = true;
		this.updateMap();
	},
	
	
	sortRecent: function() {
		this.$.quakeList.setSort(this.$.quakeList.sortRecent);
		this.$.quakeList.refreshList();
	},
	
	sortClosest: function() {
		this.$.quakeList.setSort(this.$.quakeList.sortClosest);
		this.$.quakeList.refreshList();
	},
	
	sortFarthest: function() {
		this.$.quakeList.setSort(this.$.quakeList.sortFarthest);
		this.$.quakeList.refreshList();
	},
	
	sortLargest: function() {
		this.$.quakeList.setSort(this.$.quakeList.sortLargest);
		this.$.quakeList.refreshList();
	},
	
	sortSmallest: function() {
		this.$.quakeList.setSort(this.$.quakeList.sortSmallest);
		this.$.quakeList.refreshList();
	}
});
