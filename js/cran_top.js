
function add_recent(data) {
    var parent = document.getElementById("recently-updated");
    var text = "<ul>";
    for (var pkg in data) {
	var name = data[pkg].name;
	var date = moment(data[pkg].date);
	var fdate = date.format("ddd MMM DD YYYY hh:mm:ss [UTC]");
	text += '<li>' + timeago(fdate) +
	    '<a href="http://cran.r-project.org/package=' +
	    name + '"> ' + name + '</a></li>';
    }
    text += "</ul>";
    parent.innerHTML = text;
}

function get_recent() {
    var recent_url = "http://db.r-pkg.org/-/pkgreleases?limit=20&descending=true";
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
    var topdep_url = "http://db.r-pkg.org/-/topdeps/devel";
    $.get(topdep_url, add_topdep)
}

get_recent();
get_topdep();
