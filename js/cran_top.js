
function short_date(date) {
    if (moment(date) < moment()) {
	return moment(date)
	    .fromNow()
	    .replace("seconds ago", "1m")
	    .replace("a few seconds", "1m")
	    .replace("a minute ago", "1m")
	    .replace(" minutes ago", "m")
	    .replace("an hour ago", "1h")
	    .replace(" hours ago", "h")
	    .replace("a day ago", "1d")
	    .replace(" days ago", "d")
	    .replace("a month ago", "1M")
	    .replace(" months ago", "M")
	    .replace("a year ago", "1y")
	    .replace(" years ago", "y")
    } else {
	return "1s";
    }
}

function add_recent(data) {
    var parent = document.getElementById("recently-updated");
    var text = "<ul>";
    for (var pkg in data) {
	var name = data[pkg].name;
	var date = short_date(data[pkg].date);
	text += '<li>' + date +
	    '<a href="http://cran.r-project.org/package=' +
	    name + '"> ' + name + '</a></li>';
    }
    text += "</ul>";
    parent.innerHTML = text;
}

function get_recent() {
    var recent_url = "http://db2.r-pkg.org/-/pkgreleases?limit=20&descending=true";
    $.get(recent_url, add_recent)
}

function add_topdep(data) {
    var parent = document.getElementById("most-depended-upon");
    var text = "<ul>";
    for (var pkg in data) {
	var key = Object.keys(data[pkg]);
	var value = data[pkg][key];
	text += "<li>" + value + " " +
	    '<a href="http://cran.r-project.org/package=' + key + '">' +
	    key + '</a></li>';
    }
    text += "</ul>";
    parent.innerHTML = text;
}

function get_topdep() {
    var topdep_url = "http://db2.r-pkg.org/-/topdeps/devel";
    $.get(topdep_url, add_topdep)
}

get_recent();
get_topdep();
