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
    for (var i=0, len=data.length; i<len; i++) {
        lookup[data[i].name] = data[i];
        lookup[data[i].aliases] = data[i];
        /* for (var j=0, len=lookup.length; j<len; j++) {
            console.log(i,j)
            if (data[i] === j) {
                console.log('duplicate')
                continue
            } else {
                lookup[data[i].aliases] = data[i];
            }
        } */ 
        
    }
    console.log(lookup)
    var results = []
    var allNames = Object.keys(lookup);
    allNames.forEach(function(name) {
        if (name.toLowerCase().startsWith(input.toLowerCase())
        || name.toLowerCase().includes(' '+input.toLowerCase())
        || name.toLowerCase().includes(';'+input.toLowerCase())) {
            /* if(results.some(person => person.name === name)) {
                console.log('already exists')
                const removeIndex = results.findIndex(obj => obj.name === name);
                results.splice(removeIndex, 1);
            } else { */
            results.push(lookup[name]);
            
        };
    });
    var sortedResult = removeDuplicates(results.sort((p1, p2) => p1.name > p2.name));
    return sortedResult; 
}

function removeDuplicates(arr) {
    return [...new Set(arr)]
}

function searchInput(id) {
    var input = document.getElementById(id).value;
    var results = pep.findName(input)
    console.log(results)
    return results
}

function checkIsResultsPage() {
    if (document.getElementById("hjem").classList.contains('hidden')){
        return true
    }
}

function switchElement(results, home) {
    if (checkIsResultsPage()) {return} else {
    document.getElementById(results).classList.remove('hidden');
    document.getElementById(results).classList.add('visible');
    document.getElementById(home).classList.remove('visible');
    document.getElementById(home).classList.add('hidden');}
}


function addElement(element, parentId, divId, divClass, data='') {
    const newDiv = document.createElement(element);
    newDiv.setAttribute('id', divId)
    newDiv.setAttribute('class', divClass)
  
    const newContent = document.createTextNode(data);
    newDiv.appendChild(newContent);
  
    const currentDiv = document.getElementById(parentId);
    currentDiv.appendChild(newDiv);
  }

function listBuilder(results) {
    let regionName = new Intl.DisplayNames(['en'], {type: 'region'});
    for (var i = 0, len = results.length; i < len; i++) {
        addElement('div', "resultat_liste", "hit_"+i, "hit-item")
        addElement('button', "hit_"+i, "name_"+results[i].id, "hit-name collapsible", results[i].name)
        addElement('div', "hit_"+i, "hit_"+i+"_content", "hit-info collapsed-content")
        if (results[i].birth_date == '') {
            addElement('div', "hit_"+i+"_content", "birthdate_"+results[i].id, "hit-birth", "Fødselsdato: Ingen tilgjengelig")
        } else {
            addElement('div', "hit_"+i+"_content", "birthdate_"+results[i].id, "hit-birth", "Fødselsdato: "+results[i].birth_date)
        }
        if (/cshh|csxx|ddde|suhh|yucs|gb-nir|gb-sct/.test(results[i].countries)) {
            addElement('div', "hit_"+i+"_content", "country_"+results[i].id, "hit-country", "Land: "+results[i].countries)
        } else {
            addElement('div', "hit_"+i+"_content", "country_"+results[i].id, "hit-country", "Land: "+regionName.of(results[i].countries))
        }
        addElement('div', "hit_"+i+"_content", "category_"+results[i].id, "hit-category", "Kategorisering: "+results[i].dataset)
    }
}

function executeSearch() {
    if (checkIsResultsPage()) {
        var results = searchInput("results_search_input")
    } else {
        switchElement("resultater", "hjem")
        var results = searchInput("home_search_input")
    }

    if (results == false) {
        document.getElementById("antall_hits").innerHTML = `: Ingen`
        addElement('p', "resultater", "no_results", "search-description", "Ops! Vi fant ingen PEP-er. Gjerne prøv igjen.")
    } else {
        document.getElementById("antall_hits").innerHTML = `: ${results.length}`
    }
    
    
    if (document.getElementById("resultat_liste")) {
        document.getElementById("resultat_liste").remove()
    }
    addElement('ul', "resultater", "resultat_liste", "all-hits col-8")
    
    listBuilder(results)
    collapsible()
    return results
}

/* ------- COLLAPSIBLE RESULTS ------- */

function collapsible() {
    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "60px";
        } 
      });
    }
}



/* ------- ENTER TO SEARCH ------- */
/* $("#home_search_input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#home_search_button").click();
    }
});

$("#results_search_input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#search_icon_button").click();
    }
}); */

/* function hitEnter(inputfield, enterbutton) {
    var input = document.getElementById(inputfield);
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById(enterbutton).click();
        }
    });
}
hitEnter("home_search_input", "home_search_button")
hitEnter("results_search_input", "search_icon_button") */
