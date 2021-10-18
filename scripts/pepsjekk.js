/* ------- CSV DATABASE FUNCTIONS ------- */

function csvJSON(csv){
    var lines=csv.split("\n")
    var result = [];
    var headers=lines[0].slice(1, -1).trim().split('","');
  
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].slice(1, -1).trim().split('","');
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
  }

function hent(url, obj, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            console.log(request.responseText)
            obj.data = csvJSON(request.responseText);
            console.log(obj.data)
            if (callback) {
                callback(obj);
            }
        }
    };
    request.send();
}

function Datasett(url, callback) {
    this.url = url;
    this.onload = callback || null;
    this.load = function () {
        if (this.url == undefined) {
            throw "fil eller url mangler";
        }
        hent(this.url, this, this.onload);
    };
    this.findName = function (input) {
        return allHits(input, this.data)
    }
}

let pep = new Datasett('../pep.csv');
pep.load();


/* ------- SEARCH FUNCTIONS ------- */

function allHits(input, data) {
    if (input == '') {
        return false
    }
    var lookup = {};
    for (var i = 0, len = data.length; i < len; i++) {
        lookup[data[i].name] = data[i];
        lookup[data[i].aliases] = data[i];
    }
    var result = []
    var allNames = Object.keys(lookup);
    allNames.forEach(function(name) {
        if (name.toLowerCase().startsWith(input.toLowerCase())
        || name.toLowerCase().includes(' '+input.toLowerCase())
        || name.toLowerCase().includes(';'+input.toLowerCase())) {
            result.push(lookup[name]);
        };
    });
    var sortedResult = result.sort((p1, p2) => p1.name > p2.name);
    return sortedResult; 
}

function searchInput() {
    var input = document.getElementById("pep_search_input").value;
    var results = pep.findName(input)
    console.log(results)
    return results
}

function switchElement(ny, gammel) {
    document.getElementById(ny).classList.remove('hidden');
    document.getElementById(ny).classList.add('visible');
    document.getElementById(gammel).classList.remove('visible');
    document.getElementById(gammel).classList.add('hidden');
}

function executeSearch() {
    var results = searchInput()
    switchElement("resultater", "hjem")

    for (var i = 0, len = results.length; i < len; i++) {
        
    }

    return results
}



/* ------- ENTER TO SEARCH ------- */
$("#pep_search_input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#pep_search_button").click();
    }
});

$("#pep_search_input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#search_icon_button").click();
    }
});

/* $("#pep_search_input").click(function() {
    alert("Button clicked");
}); */

