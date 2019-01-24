//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

enyo.kind({
	kind: enyo.VFlexBox,
	pack: "justify",
	align: "justify",
	name:"ImageViewer",
	events: {
		onLoaded: ""
		},
	components: [	
		{flex:1,name: "imageViewHeader", className: "ivHeader", content: ""},
		{flex:1,name: "imageViewTitle",  className: "imageTitle", content: ""},
		{flex:1, name: "imageViewTitleLink", className: "imageTitle", allowHtml: true, content:""},
		{flex: 20, components: [
			{name: "imageView", kind: "Carousel", revealAmount: 0, onSnap: "snapFinish", onGetLeft: "getLeft", onGetRight: "getRight"}
		]},
		{flex: 1, name: "imageViewFooter", className: "ivFooter", content: ""}
	],
	
	create: function() {
		this.inherited(arguments);
		this.images = [];
	},
	
	loadImages: function (title, images) {
		console.log("Loading images for: " + title);
		this.createComponent({name: "imageLoader", kind: "ImageLoader",  onLoaded:"imagesLoaded"});
		this.$.imageViewHeader.setContent(title);
		this.$.imageLoader.loadImages(images);
	},
	
	imagesLoaded: function () {
		this.images = this.$.imageLoader.images.sort(this.sortByImageOrder);
		this.doLoaded(this.images.length);
	},
	
	
	displayImages: function () {
		this.index = 0;
		this.$.imageView.setCenterView(this.getView(this.index));
		this.snapFinish();
	},
	
	sortByImageOrder: function (a,b) {
		var x = parseFloat(a.order);
		var y = parseFloat(b.order);
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	},

	getView: function(inIndex) {
		var panel = {};
		var haveView = false;
		var view = null;
		var imageContent = "";
		
		if (this.images.length == 0 && inIndex == 0) {
			imageContent = "No Images Available";
			haveView = true;
		}
		else if (this.images[inIndex]) {
			imageContent =  "<img src='" + this.images[inIndex].url + "'/>"	
			haveView = true;
		}
		if (haveView) {
			var rightContent = "";
			var leftContent = "";
			var leftIndicator = "./icons/go-prev-pic.png";
			var rightIndicator = "./icons/go-next-pic.png";
			if (inIndex > 0) {
				leftContent = "<img src ='" + leftIndicator + "'/>";
			}
			if (inIndex < this.images.length -1) {
				rightContent = "<img src ='" + rightIndicator + "'/>";
			}
			view =  {kind: "HFlexBox", align: "justify", pack:"justify", components: [
						/* commented out the event handler for onclick due to a problem with the view index being out of sync when the 
							click handler moves the images.  See PR #13
						*/
						{flex:3, align: "justify", pack: "justify", kind: "VFlexBox", components: [
							{content: ""},
							{content: leftContent, className: "moreIndicator", frameIndex:inIndex-1,/* onclick: "moveImage" */},
							{content: ""}
						]},
						{flex:20, align: "justify", pack: "justify", kind: "VFlexBox", className: "imageViewerImage", components: [
							{content: ""},
							{content: imageContent},
							{content: ""}
						]},
						{flex:3, align: "justify", pack: "justify", kind: "VFlexBox", components: [
							{content: ""},
							{content: rightContent, className: "moreIndicator", frameIndex:inIndex-1,/* onclick: "moveImage" */},
							{content: ""}
						]}
					],
					index: inIndex
					};
		}
		else {
			console.log ("No View Available...");
		}
		return view;
	},
	
	getLeft: function(inSender, inSnap) {
		inSnap && this.index--;
		return this.getView(this.index-1);
		
	},
	
	getRight: function(inSender, inSnap) {
		inSnap && this.index++;
		return this.getView(this.index+1);
	},
	
	snapFinish: function () {
		var view = this.$.imageView.fetchView("center")
		var title = "";
		var footer = "";
		var titleLink = "";
		if (this.images.length > 0 && view) {
			titleLink = "<a href = '" + this.images[view.index].info + "'><img src = 'icons/website-icon.png'/></a>"
			title = this.images[view.index].title
			footer = (view.index+1) + "/" + this.images.length;
		}
		this.$.imageViewTitle.setContent(title);
		this.$.imageViewTitleLink.setContent(titleLink);
		this.$.imageViewFooter.setContent(footer);
		console.log("Center View index: " + view.index);
	},
	
	moveImage: function (sender, event) {
		var index = sender.frameIndex;
		this.$.imageView.setCenterView(this.getView(index));
		this.snapFinish();
	}

});

enyo.kind({
	name: "ImageLoader",
	kind: enyo.Component,
	events: {onLoaded:""},
	create: function () {
		this.inherited(arguments);
	},
	
	loadImages: function (links) {
		this.images = [];
		this.imageObjs = [];
		this.links = links;
		this.imageIndex = 0;
		this.linkCount = 0;
		for (var i=0; i <this.links.length; i ++) {
			//console.log("Loading image: " + links[i].url);
			this.imageObjs[i] = new Image();
			this.imageObjs[i].onerror = this.imageError.bind(this);
			this.imageObjs[i].onload = this.imageLoaded.bind(this);
			this.imageObjs[i].title = this.links[i].info + "|" + this.links[i].order + "|" + this.links[i].title;
			this.imageObjs[i].src = this.links[i].url;	
		}	
	},
	checkLoaded: function () {
		if (this.linkCount >= this.links.length) {
			console.log(this.images.length + " images successfully loaded.");
			this.doLoaded();
		}
	},
	imageLoaded: function (inEvent) {
		this.images[this.imageIndex++] = {	
			info: 	inEvent.currentTarget.title.split("|")[0],
			order: 	inEvent.currentTarget.title.split("|")[1], 
			title: inEvent.currentTarget.title.split("|")[2],
			url: 	inEvent.currentTarget.src, 
		};
											
		//console.log("Image Loaded: " + inEvent.currentTarget.src);
		this.linkCount++;
		this.checkLoaded();
	},
	
	imageError: function (inEvent) {
		//console.log("Image Load Error: " + inEvent.currentTarget.src);
		this.linkCount++;
		this.checkLoaded();
	}

});