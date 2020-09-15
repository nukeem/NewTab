var historySections = document.querySelector("#history-sections"),
	newsSections = document.querySelector("#news-sections"),
	historyFilters = {
		Questions: ["stackoverflow.com"],
		Respositories: ["github.com", "codeplex.com", "bitbucket.com"],
		Playgrounds: ["jsbin.com", "jsfiddle.net", "dotnetfiddle.net"],
		Inspiration: ["codepen.io", "dribbble.net"],
		Docs: ["drive.google.com"]
	},
	maxHistoryResults = 2000,
	maxRecent = 6,
	feedItems = 32,
	layout = "grid",
	myfeeds = {};

/**
* Get the 100 most recent and group them up
*/
function getHistory() {
	chrome.history.search({text: '', maxResults: maxHistoryResults}, function(data) {
		var commonDomains = [];
		var lists = { Common: [], Questions: [], Respositories: [], Playgrounds: [], Inspiration: [], Docs: [] };
		//  Group all the history into lists.
		data.forEach(function(page) {
			if (page.title == "") { page.title = page.url.substring(0, 30); }
					
			for (var f in historyFilters) {
				for (var i = 0; i < historyFilters[f].length; i++) {
					if (page.url.toLowerCase().indexOf(historyFilters[f][i]) > -1) {
						if (lists[f].length < maxRecent){ 
							lists[f].push(page);
						}
						break;
					}
				}
			}
		});
		
		//  sort the data based on visitor count then get top X
		data.sort(function(a, b) { 
			return b.visitCount - a.visitCount;
		});
		var i = 0;
		while (lists.Common.length < maxRecent) {
			if (data[i]) {
				var url = breakURL(data[i].url);
				if (commonDomains.indexOf(url.scheme+url.host) == -1){
					commonDomains.push(url.scheme+url.host);
					lists.Common.push(data[i]);
				}
				i++;
				if (i >= data.length) { break; }
			}
		}
		
		//  Out put the history sections
		for (var k in lists) {
			if (lists[k].length > 0) {
				var newSection = render("<div class='section'><h3>"+k+"</h3></div>");
				lists[k].forEach(function(page) {
					var url = breakURL(page.url);
					

					newSection.appendChild(render("<div class='section-item'><a href='" + page.url + "' target='_blank'><img src='chrome://favicon/"+url.scheme+url.host+"'/> &nbsp;&nbsp;<span>" + page.title + "</span></a></div>"));
				});
				historySections.appendChild(newSection);
			}
		}

	});
}

/**
* Break a url into scheme and host.
*/
function breakURL(url) { 
	var scheme = (url.indexOf("https://") > -1) ? "https://" : "http://",
		host = url.replace(scheme, "");
	host = host.substring(0, host.indexOf("/"));
	return {scheme: scheme, host: host};
}

/**
* Ajax to get the combined RSS feeds.
*/
function fetchRSS(feeds){
	myfeeds = feeds;
	newsSections.innerHTML = "<div class='loader'>loading</div>";
	newsSections.classList.add(layout)
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4) {
			try {
				newsSections.innerHTML = "";
				var rss = JSON.parse(xhr.responseText);
				var items = rss;
				for (var i = 0, len = items.length; i < len; i++) {
					var title = items[i].title;
					var image = (items[i].image == "") ? items[i].source : "<img src='"+items[i].image+"' />";
					var description = items[i].description;
					var name = items[i].source;
					var color = myfeeds[name].color;
					var pubDate = items[i].pubDate;
					
					//  Stip the HTML from the description
					var renderedDesc = render("<div>"+description+"</div>");
					if (renderedDesc) {
						description = renderedDesc.textContent;
						//  if we didnt get an image but there is one in the description
						if (renderedDesc.querySelector("img") && image == items[i].source) {
							image = "<img src='"+renderedDesc.querySelector("img").src+"' />";
						}
					}
					
					//  Generate the link
					var link = items[i].link;
					var d = new Date(Date.parse(pubDate));
					var strDate = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay() + " " + d.getHours() + ":" + d.getMinutes();
					newsSections.appendChild(render("<article class='news-item' style='border-bottom: 1px solid " + color + ";'><div><a target='_blank' href=\"" + link + "\"><div class='img' style='background: " + color + "; color: #" + contrastingColor(color.replace("#", "")) + "'>"+image+"</div><div title='"+title.replace("'", "")+"' class='title'>" + title + "</div><p>" + description + "</p><div class='name'>"+name+" <span class='pubdate'>"+strDate+"</span></div></a></div></article>"));
				}
			} catch (e) {
				newsSections.appendChild(render("<div class='error'>An error occured trying to get feeds.</div>"));
				console.log(e);
			}
		};
	}
	xhr.open("POST", "https://feed-combiner.herokuapp.com/", true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	
	//  Convert the feeds object into a list for the rss generator
	var params = "";
	for (var k in feeds) {
		params += k + "=" + feeds[k].url + ";";
	}
	xhr.send(encodeURI( "maxItems=" + feedItems + "&feeds=" + params.substring(0, params.length-1) ));
}

getHistory();

var defaultFeeds = {
	"BBC": {url: "http://feeds.bbci.co.uk/news/technology/rss.xml", color: "#BB1919"},
	"Mashable": {url: "http://feeds.mashable.com/Mashable/Tech", color: "#F9F9F9"},
	"Hacker News": {url: "https://news.ycombinator.com/rss", color: "#ff2000"},
	"Hack a day": {url: "https://hackaday.com/blog/feed/", color: "#000000"}
};

chrome.storage.sync.get(function(data) {
	if (data.feedItems) feedItems = data.feedItems;
    if (data.feeds) defaultFeeds = data.feeds;
	if (data.layout) layout = data.layout;
	fetchRSS(defaultFeeds);
});




function render(str) {
	var d = document.createElement("div");
	d.innerHTML = str;
	return d.firstChild;
}


function contrastingColor(color)
{
    return (luma(color) >= 165) ? '000' : 'fff';
}
function luma(color) // color can be a hx string or an array of RGB values 0-255
{
    var rgb = (typeof color === 'string') ? hexToRGBArray(color) : color;
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
}
function hexToRGBArray(color)
{
    if (color.length === 3)
        color = color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2);
    else if (color.length !== 6)
        throw('Invalid hex color: ' + color);
    var rgb = [];
    for (var i = 0; i <= 2; i++)
        rgb[i] = parseInt(color.substr(i * 2, 2), 16);
    return rgb;
}