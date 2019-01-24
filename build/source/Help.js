enyo.kind({
   name: "Help",
   kind: "VFlexBox",
   events: {onDone:""},
   components: [
		{kind: "PageHeader", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
			{content:"Help"}
		]},
		{kind: "HFlexBox", align: "center", components: [
			{flex: 1, kind: "Spacer"},
			{flex: 3, kind: "RowGroup", components: [
				{content: "Contact Developer", onclick: "contactMe"},
				{content: "Developer Website", onclick: "visitMe"},
				{kind: "Item",  onclick: "versionDetails", components: [
					{name: "drawer", kind: "Drawer", caption: "Version Details", animate: true,  open: false, onclick: "versionDetails", components: [
						{kind: "VFlexBox", components: [
							{kind: "HFlexBox", components: [
								{flex: 1, className: "versionDetails_name", content: "Version:"},
								{flex: 5, className: "versionDetails_value", content: enyo.fetchAppInfo().version},
							]},
							{kind: "HFlexBox", components: [
								{flex: 1, className: "versionDetails_name",  content: "Revision:"},
								{flex: 5, className: "versionDetails_value",  content: RBTDEV_VersionInfo.Revision},
							]},
							{kind: "HFlexBox", components: [
								{flex: 1, className: "versionDetails_name", content: "Revision Date:"},
								{flex: 5, className: "versionDetails_value", content: RBTDEV_VersionInfo.LastRevDate}
							]},	
							{kind: "HFlexBox", components: [
								{flex: 1, className: "versionDetails_name", content: "Build Date:"},
								{flex: 5, className: "versionDetails_value", content: RBTDEV_VersionInfo.BuildDate},
							]}			
						]}
					]}
				]},
				{name: "doneButton", kind: "Button", caption: "Done", onclick: "done"}
			]},
			{flex: 1,kind: "Spacer"}
		]},
		{name: "launcher",  
			kind: "PalmService",  
			service: "palm://com.palm.applicationManager/",  
			method: "open"
		}
	],
	
	create: function () {
		this.inherited(arguments);
	},
	
	contactMe: function () {
		/*added line for svn test */
		
		var device =  enyo.fetchDeviceInfo().modelName;
		var osVersion = enyo.fetchDeviceInfo().platformVersion;
		var appTitle =  enyo.fetchAppInfo().title + " v" + enyo.fetchAppInfo().version;
		var subject = appTitle;
		var body = "<p>&nbsp</p><hr>" +
			"Device : " + device + "<br>" +
			"OS Version : " + osVersion + "<br>" +
			"App Name : " + appTitle + "<br>" + 
			"Revision : " + RBTDEV_VersionInfo.Revision  + "<br>" + 
			"Modified : " + RBTDEV_VersionInfo.Modified   + "<br>" + 
			"LastRevDate :" + RBTDEV_VersionInfo.LastRevDate + "<br>" + 
			"BuildDate : " + RBTDEV_VersionInfo.BuildDate  + "<br>";

			var params = {
			recipients: [{value: "support@rbtdev.com", type: "email", role: 1, contactDisplay: "RBT Development"}],
			summary : subject,
			text: body
		};
		this.$.launcher.call({id: "com.palm.app.email", params:params});
	},
	
	visitMe: function () {
		var params = {
				target: "www.rbtdev.com"
			};
		this.$.launcher.call({id: "com.palm.app.browser", params:params});
	},
	
	versionDetails: function (sender, inEvent) {
		//this.$.drawer.open();
	},
	
	done: function () {
		this.doDone();
	}
});