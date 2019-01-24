enyo.kind({
	name: "Quaker",
	kind: enyo.VFlexBox,	
	components: [
		{flex: 1, name: "pane", kind: "Pane", components: [
			{kind: "HFlexBox",  components: [
				{width: "256px", kind:"VFlexBox", components: [
					{flex: 1,name:"quakeList", kind: "QuakeList", onListItemsClosed: "quakeListClosed", onUpdated: "quakeListUpdated", onNewItem: "newQuakes", onListItemSelected: "listItemSelected"},
					{kind: "Toolbar", pack: "justify", components: [
						{kind: "ToolButtonGroup", components: [
							{name: "sortButton", caption: "Sort", onclick: "sortMenuClick"},
							{name: "filterButton", caption: "Filter"}
						]},
						{icon: "icons/menu-icon-sync.png", onclick: "refreshQuakes"}
					]},
					{name: "sortMenu", kind: "Menu", components: [
						{caption: "Most Recent", onclick: "sortRecent"},
						{caption: "Closest",  onclick: "sortClosest"},
						{caption: "Farthest", onclick: "sortFarthest"},
						{caption: "Largest",  onclick: "sortLargest"},
						{caption: "Smallest", onclick: "sortSmallest"}
					]}
				]},
				{flex:1, kind: "VFlexBox", components: [
					{flex:1, name: "viewPane", className: "viewPane", kind: "Pane", components: [
						{name: "mapView", kind: "VFlexBox", content: "<div id='map_canvas' style='border: solid 1px black;'></div> " },
						{kind: "Scroller", className: "webView", name: "webView", components: [
							{name: "webViewBrowser", kind: "WebView", url: "http://usgs.gov"}
						]},
						{name: "imageViewer", kind: "ImageViewer", className: "imageViewer", onLoaded: "imagesLoaded"}
					]},
					{name: "viewMenu", pack: "justify", kind: "Toolbar", components: [
						{kind: "ToolButtonGroup", name: "mapButtons", components: [
							{name: "back", caption: "Back", onclick: "webViewBack"},
							{name: "forward", caption: "Forward", onclick: "webViewFwd"}
						]},
						{kind: "RadioToolButtonGroup", components: [
							{name: "mapViewButton", label: "map", onclick: "displayMapView"},
							{name: "webViewButton", label: "web", onclick: "displayWebView"},
							{name: "imageViewButton", className: "imageButton", disabled: true, onclick: "displayImageView"},
							{name: "statsViewButton", label: "stats", disabled: true}
						]} 
					]}
				]}
			]}
		]},
		{name:"dashboard", kind: "Dashboard", onMessageTap: "dashboardTap"},
		{name:"quakeMap", kind: "Map", canvas:"map_canvas", key: "AkISCYsPW8NmwIiKK3VEGAdGX0Udl-n5RvTt8tmWNJjWCf3OYlvuYt_DPO6VHhVh",
				zoom: 2, center: {lat:0,long:-150}, onPinClick: "pinClick"}
	],


	create: function() {
		this.inherited(arguments);
		this.locationManager = new LocationManager();
		this.locationManager.setUnits(this.locationManager.Miles);
		this.imageUrls = [];
		this.start();
	},
	
	start: function() {
		var options = 	{	locationManager: this.locationManager, 
							refresh:1000*60*5, 
							alertOptions: {magnitude: 2, distance: 1000}
						};
		this.$.quakeList.start(options);
	},

	refreshQuakes: function() {
		this.$.quakeList.update();
	},
	
	quakeListClosed: function () {
		// console.log("Zomming out...");
		this.$.quakeMap.zoomOut();
		// console.log("Zoomed Out...");
		this.$.webViewBrowser.setUrl("http://usgs.gov");
	},
	
	webViewBack: function () {
		this.$.webViewBrowser.goBack();
	},
	
	webViewFwd: function () {
		this.$.webViewBrowser.goForward();
	},
	
	quakeListUpdated: function () {

		// console.log("Loading Map...");
		this.$.quakeMap.load();
		// console.log("Map Loaded...");
		// console.log("Clearing Pins...");
		this.$.quakeMap.clearPins();
		for (var i = 0; i< this.$.quakeList.length(); i++) {
			var quakeLocation = this.$.quakeList.getLocation(i);
			// console.log("Adding Pin...");
			this.$.quakeMap.addPin(quakeLocation.lat, quakeLocation.lon, this.$.quakeList.getMagnitude(i));
			// console.log("Added Pin..");
			this.$.quakeList.mapPin(i,i);
		}
		this.locationManager.getCurrentLocation(this.addHomePin.bind(this));
	},

	
	dashboardTap: function (event, layer) {
/* 		event.cancelBubble = true;
		if (event.stopPropagation) {
		  event.stopPropagation();
		}
		var index = layer.index;
		this.$.quakeList.selectItem(index);
		this.$.quakeMap.zoomTo(index);
 */	
	},
	
	displayMapView: function ()
	{
		this.$.viewPane.selectView(this.$.mapView);
	},
	
	displayWebView: function ()
	{
		this.$.viewPane.selectView(this.$.webView);
	},
	
	displayImageView: function () 
	{
		this.$.viewPane.selectView(this.$.imageViewer);
	},
	
	addHomePin: function () {
		// console.log("Adding Home...");
		this.$.quakeMap.addHome(this.locationManager.latitude, this.locationManager.longitude); 	
		// console.log("Added Home...");
	},
	
	newQuakes: function (event, title, text, index) {
		this.$.dashboard.layers.push({title: title, text: text, icon: "icons/earthquake.png", index:index});
		this.$.dashboard.updateWindow();
	},
	
	pinClick: function (event, index) {
		this.$.quakeList.selectItem(this.$.quakeList.findPin(index));
	},
	
	listItemSelected: function(event, quakeUrl, images, index) {		
		this.$.quakeMap.zoomTo(this.$.quakeList.pinIndex(index));
		this.$.imageViewer.loadImages(images);
		this.$.webViewBrowser.setUrl(quakeUrl);
	},
	
	imagesLoaded: function (event, count) {
		console.log("Image Count = " + count);
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
