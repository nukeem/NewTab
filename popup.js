var feeds = {
		"Mashable": "http://feeds.mashable.com/Mashable/Tech",
		"Hacker News": "https://news.ycombinator.com/rss",
		"Hack a day": "https://hackaday.com/blog/feed/"	
	},
	feedItems = 32,
	list = document.querySelector("#feedList"),
	txtName = document.querySelector("#txtName"),
	txtURL = document.querySelector("#txtURL"),
	btnSave = document.querySelector("#btnSave"),
	btnCancel = document.querySelector("#btnCancel"),
	btnAdd = document.querySelector("#btnAdd"),
	divNew = document.querySelector("#divNew"),
	txtItems = document.querySelector("#items"),
	txtColor = document.querySelector(".colorPicker"),
	layout = "grid";

	//  initial load
chrome.storage.sync.get(function(data) {
    if (data.feeds) feeds = data.feeds;
	if (data.feedItems) feedItems = data.feedItems;
	if (data.layout) layout = data.layout;
	
	txtItems.value = feedItems;
	
	if (layout === "grid") {
		document.querySelector("#btnGrid").classList.add("active");
	} else {
		document.querySelector("#btnList").classList.add("active");
	}
	
	
	showList();
});

function showList(){
	list.innerHTML = "";
	for (var k in feeds) {
		var c = document.createElement("div");
		c.innerHTML = "<div class='col-1'>" + k + "</div><div class='col-2'><a href='javascript: void(0);' data-name='" + k + "' class='btnEdit text-blue'>&#9998;</a> <a href='javascript: void(0);' class='btnDelete text-red' data-name='" + k + "'>&#10006;</a></div>";
		list.appendChild(c);
		
		bind(c.querySelector(".btnEdit"), "click", editFeed);
		bind(c.querySelector(".btnDelete"), "click", deleteFeed);
	}
}

function deleteFeed(e) {
	var feedName = e.target.getAttribute("data-name");
	if (confirm("Are you sure you want to delete " + feedName + "?")) {
		var feedName = e.target.getAttribute("data-name");
		delete feeds[feedName];
		save();
	}
}
function editFeed(e) {
	var feedName = e.target.getAttribute("data-name");
	console.log(feeds[feedName]);
	txtName.value = feedName;
	txtURL.value = feeds[feedName].url;
	txtColor.style.background = txtColor.style.color = txtColor.value = feeds[feedName].color;
	divNew.style.height = "auto";
	divNew.style.opacity = "1";
	btnAdd.style.display = "none";
	feedList.style.display = "none";
	save();
}
function save() {
	chrome.storage.sync.set({ feeds: feeds, feedItems: feedItems, layout: layout });
	chrome.storage.sync.set({ "feedItems": feedItems });
	console.log({ feeds: feeds, feedItems: feedItems, layout: layout });
	showList();
}

bind(btnAdd, "click", function(e){
	divNew.style.height = "auto";
	divNew.style.opacity = "1";
	btnAdd.style.display = "none";
	feedList.style.display = "none";
});

bind(btnCancel, "click", function(e){
	txtURL.value="";
	txtName.value="";
	divNew.style.height = "0px";
	divNew.style.opacity = "0";
	btnAdd.style.display = "block";
	feedList.style.display = "block";
});

bind(document.querySelector("#btnSettings"), "click", function() { toggle("#settings"); });

bind(btnSave, "click", function(e){
	txtName.classList.remove("error");
	txtURL.classList.remove("error");
	
	if (txtName.value != "" && txtURL.value != "") {
		feeds[txtName.value] = {url: txtURL.value, color: txtColor.value};
		showList();
		txtURL.value="";
		txtName.value="";
		txtColor.value="#fff";
		divNew.style.height = "0px";
		divNew.style.opacity = "0";
		btnAdd.style.display = "block";
		feedList.style.display = "block";
	} else {
		if (txtName.value != "") txtName.classList.add("error");
		if (txtURL.value != "") txtURL.classList.add("error");
	}
	save();
});

bind(txtItems, "change", function(e){
	feedItems = txtItems.value;
	console.log("saving...", feedItems);
	save();
});

bind(document.querySelector("#btnGrid"), "click", function() { 
	document.querySelector("#btnList").classList.remove("active");
	this.classList.add("active");
	layout = "grid";
	save();
});

bind(document.querySelector("#btnList"), "click", function() { 
	document.querySelector("#btnGrid").classList.remove("active");
	this.classList.add("active");	
	layout = "list"
	save();
});


function bind(ele, evt, func) {
	ele.addEventListener(evt, func, false);
}


//  Color picker
var OriginalElement = document.querySelector(".colorPicker"),
  	container = document.querySelector("#colorPicker"),
	scvs = document.querySelector("#shade"),
    sctx = scvs.getContext("2d"),
    ccvs = document.querySelector("#color"),
    cctx = ccvs.getContext("2d"),
    divColor = document.querySelector("#divColor"),
    txtColorPicker = document.querySelector("#txtColor"),
    btnOK = document.querySelector("#btnOK"),
    color = [255, 0, 0],
    chosenColor = [255, 0, 0];


function drawColourSelection(){
   var colourGradient = cctx.createLinearGradient(0, 0, 0, 150);
    colourGradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
    colourGradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
    colourGradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
    colourGradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
    colourGradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
    colourGradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
    colourGradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
    cctx.fillStyle = colourGradient;
    cctx.fillRect(0, 0, 30, 150);
}

function setup() {  
  	//  Do the onclick event
    OriginalElement.addEventListener("click", function(e) {
    	var pos = OriginalElement.getBoundingClientRect();
    	container.style.top = (pos.y + pos.height -1) + 'px';
		container.style.left = pos.x - 180 + 'px';
		container.style.maxHeight = "300px";
      
		if (OriginalElement.value != "") {
			color = chosenColor = hexToRGB(OriginalElement.value); 
			txtColorPicker.value = OriginalElement.value.toUpperCase();
			OriginalElement.style.background = divColor.style.background = OriginalElement.value;
			createShade();
		}
    })
  
    //  On select Colour
    ccvs.addEventListener("mouseup", function(e) { 	
		//  Reset the selection
		drawColourSelection();

		//  Get the color data
		color = cctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;   

		//  Show where they clicked
		  cctx.fillStyle = "#333";
		  cctx.fillRect(0, e.offsetY-1, 30, 1);
		  cctx.fillStyle = "#ccc";
		  cctx.fillRect(0, e.offsetY, 30, 1);

		  //  Generate the shade selector
		  createShade();
    })

    //  On select Shade
    scvs.addEventListener("mouseup", function(e) {
		  //  Reset the shade selector
		  createShade();

		  //  Get the color daya
		  chosenColor = sctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;    

		  //  Show where they clicked
		  sctx.beginPath();
		  sctx.strokeStyle = "#333"
		  sctx.strokeWidth = 3;
		  sctx.arc(e.offsetX, e.offsetY, 5, 0, 2 * Math.PI);
		  sctx.stroke();
		  sctx.beginPath();
		  sctx.strokeStyle = "#ccc"
		  sctx.strokeWidth = 2;
		  sctx.arc(e.offsetX, e.offsetY, 4, 0, 2 * Math.PI);
		  sctx.stroke();

		  divColor.style.background = toRGBA(chosenColor);
		  txtColorPicker.value = toHEX(chosenColor);
    })

	txtColorPicker.addEventListener("change", function(){
    	chosenColor = hexToRGB(this.value);
    	divColor.style.background = this.value;
    });
    
    btnOK.addEventListener("click", function(){
		OriginalElement.style.color = OriginalElement.style.background = OriginalElement.value = toHEX(chosenColor);
		container.style.maxHeight = "0px";
    });

    createShade();
}

function createShade() {
	sctx.clearRect(0,0,150,150);
	sctx.rect(0,0, 150, 150);
	var shadeGradient = sctx.createLinearGradient(0, 0, 150, 0);
	shadeGradient.addColorStop(0, "#fff");
	shadeGradient.addColorStop(1, toRGBA(color));
	sctx.fillStyle = shadeGradient;
	sctx.fillRect(0, 0, 150, 150);

	var shadeTransparancyGradient = sctx.createLinearGradient(0, 0, 0, 150);
	shadeTransparancyGradient.addColorStop(0, "rgba(0,0,0,0)");
	shadeTransparancyGradient.addColorStop(1, "rgba(0,0,0,1)");
	sctx.fillStyle = shadeTransparancyGradient;
	sctx.fillRect(0, 0, 150, 150);
}

function toRGBA(color) {
	return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 1)";
}
  
function toHEX(color) {
	return "#" + (color[0].toString(16) +  color[1].toString(16) + color[2].toString(16)).toUpperCase();
}
  
function hexToRGB(hex) {
	var r = parseInt(hex.slice(1,3), 16),
		g = parseInt(hex.slice(3,5), 16),
		b = parseInt(hex.slice(5,7), 16);
	return [r, g, b];
}

function toggle(sel) {
	var s = document.querySelector(sel); 
	s.style.display = (s.style.display==='none') ? '' : 'none';
}

setup();
drawColourSelection();

