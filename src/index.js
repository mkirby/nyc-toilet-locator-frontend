// ANCHOR DOM Elements
const main = document.querySelector("#main-content-div")

// ANCHOR Fetch Functions
const getToilet = id => {
    fetch(`http://localhost:3000/api/v1/toilets/${id}`)
    .then(r => r.json())
    .then(renderShow)
}

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

const getAddress = (latitude, longitude) => {
    fetch('https://maps.googleapis.com/maps/api/geocode/json?' + 'latlng=' + latitude + ',' + longitude + '&key=' + GOOGLE_MAP_KEY)
    .then(r => r.json())
    .then(
        function success (response) { console.log('User\'s Address Data is ', response) },
        function fail (status) { console.log('Request failed.  Returned status of', status) }
    )
}

const averageRating = toiletReviews => {
    sum = 0
    toiletReviews.forEach(review => {
        sum += review.rating
    })
    return average = Math.floor(sum / toiletReviews.length)
}

// ANCHOR Render Functions
const renderShow = (toiletObj) => {
    main.innerHTML = ''
    main.classList.remove("main-index")
    main.classList.add("main-show")
    const divContainer = createNode("div", "selected-toilet")
    const img = document.createElement("img")
    img.src = "https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png"
    img.alt = toiletObj.name
    const likes = createNode("p", `${toiletObj.likes} Likes!`)
    const starRating = document.createElement("div")
    starRating.innerHTML = renderStarRating(toiletObj.reviews)
    const name = createNode("h3", toiletObj.name)
    const address = createNode("p", `Address:\n${toiletObj.address}`)
    const borough = createNode("p", `Borough:\n${toiletObj.borough}`)
    const neighborhood = createNode("p", `Neighborhood:\n${toiletObj.neighborhood}`)
    const location = createNode("p", `Cross Streets:\n${toiletObj.location}`)
    const handicap_accessible = createNode("p", `Handicap Accessible:\n${toiletObj.handicap_accessible}`)
    const open_year_round = createNode("p", `Open Year Round:\n${toiletObj.open_year_round}`)
    
    divContainer.append(img, likes, starRating, name, address, borough, neighborhood, location, handicap_accessible, open_year_round)
    main.append(divContainer)
}
const renderStarRating = reviewsObj => {
    let checkedStars = averageRating(reviewsObj)
    let uncheckedStars = 5 - average
    let htmlChunk = ''
    for (let i=checkedStars; i>0; i--) { htmlChunk += `<span class="fa fa-star checked"></span>`}
    for (let i=uncheckedStars; i>0; i--) { htmlChunk += `<span class="fa fa-star"></span>`}
    return htmlChunk
}

const renderComment = (reviewObj) => {
    
}

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
// init()
clickListeners()
getToilet(63)