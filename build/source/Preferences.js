enyo.kind({
   name: "Preferences",
   kind: "VFlexBox",
   events: {onChanged: ""},
   components: [
		{kind: "PageHeader", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
			{content:"Preferences"}
		]},
		{kind: "HFlexBox", align: "center", components: [
			{flex: 1, kind: "Spacer"},
			{flex: 3, kind: "RowGroup", components: [
				{name: "refreshTime", kind: "ListSelector", value: 5, label: "Refresh Time", items: [
					{caption: "Manual", value: 0},
					{caption: "5 Mins", value: 5},
					{caption: "10 Mins", value: 10},
					{caption: "15 Mins", value: 15},
					{caption: "30 Mins", value: 30},
					{caption: "1 Hour", value: 60}
				]},
				{name: "distanceUnits", kind: "ListSelector", value: "Mi", label: "Distance Units", items: [
					{caption: "Metric (Km)", value: "Km"},
					{caption: "English (Mi)", value: "Mi"}
				]},
				{name: "defaultView", kind: "ListSelector", value: "map", label: "Default View", items: [
					{caption: "Map View", value: "map"},
					{caption: "Web View", value: "web"}
				]},
				{kind: "HFlexBox", components: [
					{flex: 1, content: "Notifications"},
					{name: "notifications", kind: "ToggleButton", state: true, onLabel: "On", offLabel: "Off"}
				]},
				{kind: "HFlexBox", components: [
					{flex: 1, content: "Auto Locate Me"},
					{name: "autolocate", kind: "ToggleButton", state: true, onLabel: "On", offLabel: "Off"}
				]},
				{kind: "HFlexBox", components: [
					{flex: 1, content: "Auto Select New Quakes"},
					{name: "autoselect", kind: "ToggleButton", state: false, onLabel: "On", offLabel: "Off"}
				]},
				// {kind: "HFlexBox", components: [
					// {flex: 1, content: "Enable automatic notifications for updates"},
					// {name: "usemetrix", kind: "ToggleButton", onChange: "notifyUser", state: true, onLabel: "On", offLabel: "Off"}
				// ]},
				{name: "doneButton", kind: "Button", caption: "Done", onclick: "done"},
				{name: "notification", kind: "Popup", style: "width: 75%; text-align: center", autoClose:false, dismissWithEscape: false, dismissWithClick:false, components: [
					{style: "margin: 20px;", content: "Automatic notifications rely on a system called Metrix. In addition to providing important notifications for you, Metrix collects anonymous usage statistics to help improve the user experience.  Please confirm that you would like to use this feature.  This can be disabled at any time"},
					{layoutKind: "HFlexLayout", pack: "justify", components: [
						{kind: "Spacer"},
						{kind: "Button", style: "background-color: green", caption: "Yes", onclick: "confirmClick"},
						{kind: "Spacer"},
						{kind: "Button", style: "background-color: red", caption: "No", onclick: "cancelClick"},
						{kind: "Spacer"}
					]}
				]}
			]},
			{flex: 1,kind: "Spacer"}
		]},
	],
	
	create: function(){
		this.inherited(arguments);
		this.defaultSettings = {refreshTime: 5, 
								distanceUnits:"Mi",
								defaultView: "map",
								notifications: true,
								autolocate: true,
								autoselect: false,
								usemetrix: true};
   },
   
   
   rendered: function () {
		this.inherited(arguments);
		var settings = this.getCookie("settings");
		if (!settings) {
			// new cookie
			console.log("Creating settings cookie");
			settings = this.defaultSettings;
			this.setCookie("settings", settings);
		}
		this.setValues(settings);
   },
   
   notifyUser: function () {
		
		if (this.$.usemetrix.getState()) {
			this.$.doneButton.disabled = true;
			this.$.usemetrix.setState(false);
			this.$.notification.openAtCenter();
		}
   },
   
	confirmClick: function() {
		this.$.usemetrix.setState(true);
		this.$.doneButton.disabled = false;
		this.$.notification.close();
	},
	cancelClick: function() {
		this.$.usemetrix.setState(false);
		this.$.doneButton.disabled = false;
		this.$.notification.close();
	},   
	
   getPreferences: function () {
		return this.getCookie("settings");
   },
   
	setCookie: function(name, value) {
		var json = enyo.json.stringify(value);
		enyo.setCookie(name, json);
   },
   
	getCookie: function(name) {
		var json = enyo.getCookie(name);   
		var value = null;
		if (json != undefined){
			value = enyo.json.parse(json);
		}
		return (value);      
   },
   
    setValues: function (settings) {
		
			console.log("Checking for updated settings");
			var newValue = false;
			if (settings.firstUse != undefined) {
				this.firstUse = false;
			}
			else {
				settings.firstUse = false;
				this.firstUse = true;
			}
			
			// if (settings.usemetrix != undefined) {
				// this.$.usemetrix.setState(settings.usemetrix);
			// }
			// else {
				// newValue = true;
				// settings.usemetrix = this.$.usemetrix.getState();
			// }
			
			if (settings.autoselect != undefined) {
				this.$.autoselect.setState(settings.autoselect);
			}
			else {
				newValue = true;
				settings.autoselect = this.$.autoselect.getState();
			}
			
			if (settings.autolocate != undefined) {
				this.$.autolocate.setState(settings.autolocate);
			}
			else {
				newValue = true;
				settings.autolocate = this.$.autolocate.getState();
				console.log("Creating new defaultView setting for autolocate: " + settings.autolocate);
			}
			
			if (settings.notifications != undefined) {
				console.log("Using saved notifications: " + settings.notifications);
				this.$.notifications.setState(settings.notifications);
			}
			else {
				newValue = true;
				settings.notifications = this.$.notifications.getState();
				console.log("Creating new defaultView setting: " + settings.notifications);
			}
			
			if (settings.defaultView != undefined) {
				console.log("Using saved defaultView: " + settings.defaultView);
				this.$.defaultView.setValue(settings.defaultView);
			}
			else {
				newValue = true;
				settings.defaultView = this.$.defaultView.getValue();
				console.log("Creating new defaultView setting: " + settings.defaultView);
			}
			
			if (settings.refreshTime != undefined) {
				this.$.refreshTime.setValue(settings.refreshTime);
			}
			else {
				newValue = true;
				settings.refreshTime = this.$.refreshTime.getValue();
			}
			
			if (settings.distanceUnits != undefined) {
				this.$.distanceUnits.setValue(settings.distanceUnits);
			}
			else {
				newValue = true;
				settings.distanceUnits = this.$.distanceUnits.getValue();
			}
			
			if (newValue) {
				this.setCookie("settings", settings);
			}		
	},
	
	getValues: function () {
		return {firstUse:this.firstUse,
				refreshTime:this.$.refreshTime.value, 
				distanceUnits: this.$.distanceUnits.value, 
				defaultView: this.$.defaultView.value, 
				notifications: this.$.notifications.state, 
				autolocate: this.$.autolocate.state,
				autoselect: this.$.autoselect.state,
				usemetrix: true}
	},
	
	done: function () { 
		var settings = this.getValues();
		this.setCookie("settings", settings);
		this.doChanged();
	}
	
});