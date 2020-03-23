// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for handling basic information and other misc issues.

function checkUserDevice() {
    if(navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    }
    else {
        return false;
    }
}

function performBasicDeviceCheck() {
    if (checkUserDevice() == true) {
        alert('Mobile device detected.');
    } else {
        alert('Browser device detected.')
    }
}


// SELECT DISTINCT ?predicate ?publisher
//     WHERE {
//         ?s <http://purl.org/dc/terms/publisher> ?publisher

// SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry 
// FROM NAMED <http://localhost:8080/marmotta/context/trails>
// WHERE { 
//     GRAPH ?g {
//         ?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom .
//         ?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions .
//         ?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry
//         OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . }
//         OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . }
//     }
// }

// SELECT DISTINCT ?predicate
//     FROM <http://localhost:8080/marmotta/context/trails>
//     WHERE {
//         ?s ?predicate ?o 
//     }

function testQuery() {
    // Get query and encode it
    // TODO: Ask Matthew why the below PREFIX doesn't work
    var query_info = `
    SELECT DISTINCT ?subject ?predicate
    FROM <http://localhost:8080/marmotta/context/trails>
    WHERE {
        ?subject ?predicate ?o 
    }
    `
    var query_run = `
    SELECT ?subject ?length
    FROM NAMED <http://localhost:8080/marmotta/context/trails>
    WHERE { 
        GRAPH ?g {
            ?subject <http://dbpedia.org/ontology/length> ?length
        }
    }
    `
    query = encodeURIComponent(query_info);

    //Get the http request url.
    var httpGet = MARMOTTA_SPARQL_URL + query;
    // execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					alert("No results while creating additional information.");
				}
				else {
				    bindings = result.results.bindings;
					//go through all of the results. If 0 items, throw an error
					if(bindings.length > 0) {
                        //go through all of the results and add them to the tab.
                        var tmp = '';
						for(var i = 0; i < bindings.length; i++) {
                            tmp += bindings[i].subject.value + '\n';
                        }
                        alert(tmp);
					}
					else { //There was no results so do nothing.
						alert("No results for bindings while creating additional information.");
					}
				}
			},
			error: function(result) {
				alert("Creating query failed.");
			}
		});
}

$(document).ready(function() {
    // Perform basic checks against new user
    // TODO: Wait for Dalia's phone so we can test that a basic version works.
    // performBasicDeviceCheck();
    
    //testQuery();

    // Displaying information for help dynamically based on how many help items are in a block
    var categories = ['general', 'known-issues', 'layers', 'legal-and-privacy', 'markers', 'notifications', 'ontologies', 'query-builder']
    for(var i = 0; i < categories.length - 1; i++) {
        if ($('#faq-' + categories[i] + ' > span').length > 3) {
            $('#display-more-faq-' + categories[i]).show();
            $('#display-less-faq-' + categories[i]).hide();
            $('#faq-' + categories[i] + ' > span > a').hide();
        }
    }

    $('.display-help-more').click(function () {
        // Find parent div so we know which help block we're in
        var parent_id = $(this).parent().attr("id");
        $('#display-more-' + parent_id).hide();
        $('#display-less-' + parent_id).show();
        $('#' + parent_id + ' > span > a').slideToggle();
    });
    $('.display-help-less').click(function () {
        var parent_id = $(this).parent().attr("id");
        $('#display-more-' + parent_id).show();
        $('#display-less-' + parent_id).hide();
        $('#' + parent_id + ' > span > a').slideToggle();
    });
});