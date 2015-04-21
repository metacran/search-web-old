
// Utility

function linkify(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1'>$1</a>"); 
}

// Function to extract query parameters

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {}, tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] =
	    decodeURIComponent(tokens[2]);
    }
    return params;
}
var rawquery = document.location.search
var query = getQueryParams(rawquery);
var mypage=query.page || '1'
document.getElementById("cran_input").value=query.q

// Functions to add results in HTML

function format_package(pkg) {
    var time=moment(pkg.date).fromNow()
    var author=pkg.Maintainer.replace(/ ?<.*>/, '')
    var url=pkg.URL ? ('<div class="packageurl">' + linkify(pkg.URL) +
		       '</div>') : ''
    var ver=myindex.replace("cran-", "")
    var vlink='<a href="http://cran.r-project.org/package=' +
	pkg.Package + (ver==="devel" ? '' : '/tree/R-' + ver) +
	'">' + pkg.Version + '</a>'
    var html='<div class="package">' +
	'<h3><a href="http://cran.r-project.org/package=' + pkg.Package + '">' + 
	pkg.Package + '</a>' + ' ' + vlink + '<small> &mdash; by ' +
	author + ', ' + time + '</small></h3>' +
	'<h4>' + pkg.Title + '</h4>' +
	'<p>' + linkify(pkg.Description) + '</p>' +
	'<p>' + url + '</p>' +
	'</div>';
    return html
}

function add_results_html(pkg, div) {
    var html = format_package(pkg);
    div.innerHTML += html;
}

function add_results(hits, no_hits, took) {
    var ndiv=document.getElementById("search_no_results")    
    var div=document.getElementById("search_results")
    var pag=document.getElementById("search_pagination")
    var pag_text=""
    var nop=Math.min(Math.ceil(no_hits / 10), 10)
    var ftext=""

    if (no_hits == 0) {
	ftext = "Your search &ndash; <strong>" + query.q +
	    "</strong> &ndash; did not match any packages"
    } else if (no_hits == 1) {
	ftext = "Found " + no_hits + " package in " +
	    (took/1000).toFixed(2) + " seconds"
    } else if (mypage == 1) {
	ftext = "Found " + no_hits + " packages in " +
	    (took/1000).toFixed(2) + " seconds"
    } else {
	ftext = "Page " + mypage + " of " + no_hits + " packages"
    }
    ndiv.innerHTML += "<p>" + ftext + "</p>"

    for (var i in hits) {
	add_results_html(hits[i]._source, div)
    }

    if (no_hits > 10) {
	pag_text += '<ul class="pagination">';
	var disabled = mypage == 1 ? ' class="disabled"' : '';
	pag_text += '<li' + disabled + '><a href="?q=' +
	    encodeURIComponent(query.q) +
	    '&page=' + (mypage-1) + '">&laquo;</a></li>';
	for (var i=1; i <= nop; i++) {
	    var active = i == mypage ? ' class="active"' : '';
	    var paglink='<a href="?q=' + encodeURIComponent(query.q) +
		'&page=' + i + '">' + i + "</a>";
	    pag_text += '<li' + active + '>' + paglink + '</li>';
	}
	disabled = mypage == nop ? ' class="disabled"' : '';
	pag_text += '<li' + disabled + '><a href="?q=' +
	    encodeURIComponent(query.q) +
	    '&page=' + (+mypage+1) + '">&raquo;</a></li>';
	pag_text += '</ul>';
	pag.innerHTML = pag_text;
    }
}

// ElasticSearch client

var client = new elasticsearch.Client({
    host: 'seer.r-pkg.org:9200',
});

// Do the search

client.search({
    //    index: myindex,
    index: 'cran-devel',
    type: 'package',
    from: (mypage - 1) * 10,
    size: 10,
    "body": {
	"query": {
	    "function_score": {
		"query": { "multi_match": {
		    "tie_breaker": 1.0,
		    fields: ["Package^10", "Title^5", "Description",
			     "Author^3", "Maintainer^4", "_all" ],
		    query: query.q } },
		"functions": [
		    {
			"script_score": {
			    "script": "cran_search_score"
			}
		    }
		]
	    }
	}
    }
}).then(function (resp) {
    var hits = resp.hits.hits;
    var no_hist = resp.hits.total;
    var took = resp.took;
    add_results(hits, no_hist, took);
}, function (err) {
    console.trace(err.message);
});
