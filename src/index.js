// ANCHOR DOM Elements
const main = document.querySelector("main")

// ANCHOR Fetch Functions

// ANCHOR Event Listeners
const clickListeners = () => {
    document.addEventListener("click", e => {
        //if user clicks "Restrooms Near Me" button
        if (e.target.matches("#filter-near-me button")) {
            geolocateUser(e)
        }
    })
}


// ANCHOR Event Handlers
const geolocateUser = event => {
    if ("geolocation" in navigator) {
      // check if geolocation is supported/enabled on current browser
        navigator.geolocation.getCurrentPosition(
            function success(position) {
            // for when getting location is a success
            console.log('latitude', position.coords.latitude, 'longitude', position.coords.longitude);
            // TODO user agrees to share location then run this:
            // TODO need to import API key
            // getAddress(position.coords.latitude, position.coords.longitude)
            },
        function error(error_message) {
            // for when getting location results in an error
            console.error('An error has occured while retrieving ' + 'location', error_message)
            // TODO issue with getting location then run this:
            // ipLookUp()
        });
    } else {
        // geolocation is not supported - get your location some other way
        console.log('geolocation is not enabled on this browser')
        // TODO user has location data turned off run this:
        // ipLookUp()
    }
}

function getAddress (latitude, longitude) {
    fetch('https://maps.googleapis.com/maps/api/geocode/json?' + 'latlng=' + latitude + ',' + longitude + '&key=' + GOOGLE_MAP_KEY)
    .then(r => r.json())
    .then(
        function success (response) { console.log('User\'s Address Data is ', response) },
        function fail (status) { console.log('Request failed.  Returned status of', status) }
    )
}

// ANCHOR Render Functions
renderIndex = (array) => {
    while (main.querySelector(".toilet-card")) {
        main.querySelector(".toilet-card").remove()
    }
    array.forEach(toiletObj => {
        const divCard = createNode("div", "toilet-card")
        divCard.dataset.id = toiletObj.id
        const name = createNode("h3", toiletObj.name)
        const borough = createNode("p", toiletObj.borough)
        const neighborhood = createNode("p", toiletObj.neighborhood)
        const address = createNode("p", toiletObj.address)
        // I think we might just need address? I think that's more accurate. Let's discuss!
        const location = createNode("p", toiletObj.location)
        divCard.append(name, borough, neighborhood, address, location)
        main.append(divCard)
        
    })
}

createNode = (type, content) => {
    let node = document.createElement(type);
    switch (type) {
        case "h3":
            node.innerText = content;
            break
        case "p":
            node.innerText = content;
            break
        case "div":
            node.className = content;
            break
    }
    return node;
}

// ANCHOR Initial Render
init = () => {
    fetch("http://localhost:3000/api/v1/toilets?page=1")
    .then(r => r.json())
    .then(data => renderIndex(data))
}

// ANCHOR Function Calls
init()
clickListeners()