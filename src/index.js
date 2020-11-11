// ANCHOR DOM Elements
const main = document.querySelector("#main-content-div")
const pageControls = document.querySelector("#bottom-div")
let page = 1
let searched = false
let filterQuery

// ANCHOR Fetch Functions
const getAllToilets = () => {
    fetch(`http://localhost:3000/api/v1/toilets?page=${page}`)
        .then(r => r.json())
        .then(data => {
            console.log(data)
            renderIndexPage(data.toilets)
            renderPageControls(data.lastPage)
            renderNeighborhoodsDropdown(data.neighborhoods)
        })
}
const getToiletById = id => {
    fetch(`http://localhost:3000/api/v1/toilets/${id}`)
    .then(r => r.json())
    .then(renderShowPage)  
}
const searchToilets = query => {
    filterQuery = query
    fetch(`http://localhost:3000/api/v1/toilets?query=${query}&page=${page}`)
    .then(r => r.json())
    .then(data => {
        console.log(data)
        renderIndexPage(data.toilets)
        renderPageControls(data.lastPage)
        if (query == "Manhattan" ||query == "Brooklyn"||query == "Queens"||query == "Bronx"||query == "Staten Island") {
            renderNeighborhoodsDropdown(data.neighborhoods)
        }
    })
}
const postReview = (body) => {
    fetch(`http://localhost:3000/api/v1/reviews`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(r => r.json())
    .then(review => {
        getToiletById(review.toilet_id)
    })
}

const postToilet = (body) => {
    fetch(`http://localhost:3000/api/v1/toilets`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(r => r.json())
    .then(renderShowPage)
}

const getAddress = (latitude, longitude) => {
    fetch('https://maps.googleapis.com/maps/api/geocode/json?' + 'latlng=' + latitude + ',' + longitude + '&key=' + GOOGLE_MAP_KEY)
    .then(r => r.json())
    .then(
        function success (response) { console.log('User\'s Address Data is ', response) },
        function fail (status) { console.log('Request failed.  Returned status of', status) }
    )
}

// ANCHOR Event Listeners
const clickListeners = () => {
    document.addEventListener("click", e => {
        //if user clicks "Restrooms Near Me" button
        if (e.target.matches("#filter-near-me button")) {
            geolocateUser(e)
        } else if (e.target.matches(".toilet-card")) {
            // TODO not accurate enough - if you click elements inside the container the link doesn't work
            getToiletById(e.target.dataset.id)
        } else if (e.target.matches("#home-link")) {
            searched = false
            page = 1
            getAllToilets()
        } else if (e.target.matches(".back-to-results h3")) {
            loadMainDivContent()
        } else if (e.target.matches("#add-entry")) {
            renderAdd()
        }
    })
}

const submitListeners = () => {
    document.addEventListener("submit", e => {
        e.preventDefault()
        if (e.target.matches("#new-comment-form")) {
            createPost(e)
        } else if (e.target.matches("#filter-borough")) {
            filterByBorough(e)
        } else if (e.target.matches("#filter-neighborhood")) {
            filterByNeighborhood(e)
        } else if (e.target.matches("#new-toilet")) {
            createToilet(e)
        }
    })
}

const changeListeners = () => {
    document.addEventListener("change", e => {
        if (e.target.matches("#handicap-check")) {
            e.target.value = !e.target.value
        } else if (e.target.matches("#year-check")) {
            e.target.value = !e.target.value
        }
    })
}

// ANCHOR Event Handlers

const createToilet = e => {
    const configObj = {
        name: e.target.name.value,
        location: e.target.location.value,
        handicap_accessible: e.target.handicap.value,
        open_year_round: e.target.year.value,
        borough: e.target.borough.value,
        address: e.target.address.value,
        neighborhood: e.target.neighborhood.value,
        likes: 0,
        image: e.target.image.value,
        latitude: 1.1,
        longitude: 1.1
    }
    postToilet(configObj)
}

const filterByBorough = e => {
    searched = true
    page = 1
    searchToilets(e.target.borough.value)
}

const filterByNeighborhood = e => {
    searched = true
    page = 1
    searchToilets(e.target.neighborhood.value)
}

const createPost = e => {
    const review = {
        toilet_id: parseInt(e.target.dataset.toiletId),
        content: e.target.message.value,
        date: dayjs(Date.now()).format('YYYY-MM-DD'),
        name: e.target.username.value,
        rating: parseInt(e.target.rating.value),
        image: "https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png"
    }
    postReview(review)
}

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

// ANCHOR Render Functions

const renderNeighborhoodsDropdown = (hoodArray) => {
    const dropdown = document.querySelector("#neighborhood")
    clearElement(dropdown)
    hoodArray.forEach(hood => {
        dropdown.append(createNode("option", hood))
    })
}

const renderShowPage = (toiletObj) => {
    clearElement(main)
    clearElement(pageControls)
    main.className = "main-show"
    //show toilet half of the main container div
    const toiletDiv = document.createElement("div")
    toiletDiv.id = "toilet-div"
    // contain the toilet card
    const divContainer = createNode("div", "selected-toilet")
    //featured image
    const img = document.createElement("img")
    img.src = toiletObj.image
    img.alt = toiletObj.name
    //likes and rating
    const starRating = document.createElement("div")
    const avgStarRating = averageRating(toiletObj.reviews)
    starRating.innerHTML = renderStarRating(avgStarRating, 5 - avgStarRating)
    const likes = document.createElement("h4")
    likes.innerHTML = `
        <i class="fa fa-heart"></i> ${toiletObj.likes}
    `
    //toilet details
    const name = createNode("h3", toiletObj.name)
    const address = createNode("p", `Address:\n${toiletObj.address}`)
    const borough = createNode("p", `Borough:\n${toiletObj.borough}`)
    const neighborhood = createNode("p", `Neighborhood:\n${toiletObj.neighborhood}`)
    const location = createNode("p", `Cross Streets:\n${toiletObj.location}`)
    const handicap_accessible = createNode("p", `Handicap Accessible:\n${toiletObj.handicap_accessible}`)
    const open_year_round = createNode("p", `Open Year Round:\n${toiletObj.open_year_round}`)
    //append inner items to inner div container
    divContainer.append(img, name, starRating, likes, address, borough, neighborhood, location, handicap_accessible, open_year_round)
    //append inner div to div container

    const backToResults = document.createElement("div")
    backToResults.className = "back-to-results"
    const backTitle = createNode("h3", "Back to Results")
    backToResults.append(backTitle)

    toiletDiv.append(divContainer, backToResults)
    main.append(toiletDiv)
    //render the reviews half of the page
    renderReviews(toiletObj)
}
const renderStarRating = (checked, unchecked) => {
    let htmlChunk = ''
    for (let i=checked; i>0; i--) { htmlChunk += `<span class="fa fa-star checked"></span>`}
    for (let i=unchecked; i>0; i--) { htmlChunk += `<span class="fa fa-star"></span>`}
    return htmlChunk
}

const renderReviews = (toiletObj) => {
    //reviews half of the main container div
    const reviewsDiv = document.createElement("div")
    reviewsDiv.id = "reviews-div"
    //top half of reviews div
    const addReviewDiv = document.createElement("div")
    addReviewDiv.className = "add-review-div"
    const heading = createNode("h3", "Leave a Review")
    const form = document.createElement("form")
    form.id = "new-comment-form"
    form.dataset.toiletId = toiletObj.id
    form.innerHTML = `
        <input type="text" id="username" name="username" placeholder="Name">
        <label for="rating">Star Rating:</label>
        <select id="rating" name="rating" type="number">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select><br><br>
        <textarea name="message" placeholder="Hey... say something!" style="width:80%";></textarea><br><br>
        <input type="submit" value="Submit">
    `
    addReviewDiv.append(heading,form)
    //bottom half of reviews div
    const renderedReviews = document.createElement("div")
    renderedReviews.className = "rendered-reviews"
    //sort reviews by date then render and append
    const sorted = toiletObj.reviews.slice().sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1))
    sorted.forEach(review => {
        const singleReview = renderOneReview(review)
        renderedReviews.append(singleReview)
    })
    //append inner divs to review div
    reviewsDiv.append(addReviewDiv, renderedReviews)
    main.append(reviewsDiv)
}

const renderOneReview = reviewObj => {
    //create the review container
    const div = document.createElement("div")
    div.className = "review"
    div.dataset.reviewId = reviewObj.id
    //create delete button
    const deleteButton = createNode("button", "X")
    deleteButton.className = "delete-button"
    // create the review data
    const title = createNode("h5", `${reviewObj.name} on ${reviewObj.date}`)
    const starRating = document.createElement("div")
    starRating.innerHTML = renderStarRating(reviewObj.rating, 5 - reviewObj.rating)
    const content = createNode("p", `\'${reviewObj.content}\'`)
    //append the review data
    div.append(title, deleteButton, starRating, content)
    //return review card
    return div
}

const renderIndexPage = (toiletArray) => {
    clearElement(main)
    main.className = "main-index"
    toiletArray.forEach(toiletObj => {
        const divCard = createNode("div", "toilet-card")
        divCard.dataset.id = toiletObj.id
        const img = createNode("img", toiletObj.image)
        const name = createNode("h3", toiletObj.name)
        const borough = createNode("p", toiletObj.borough)
        const neighborhood = createNode("p", toiletObj.neighborhood)
        const address = createNode("p", toiletObj.address)
        const location = createNode("p", toiletObj.location)
        divCard.append(img, name, borough, neighborhood, address, location)
        main.append(divCard)
    })
}

const renderPageControls = (lastPage) => {
    clearElement(pageControls)
    const backButton = createNode("button", "<")
    backButton.addEventListener("click", () => {
        page--
        loadMainDivContent()
    })
    const pageNumbers = createNode("p", `Page ${page} of ${lastPage}`)

    const nextButton = createNode("button", ">")
    nextButton.addEventListener("click", () => {
        page++
        loadMainDivContent()
    })

    backButton.className = "page-controls"
    pageNumbers.className = "page-controls"
    nextButton.className = "page-controls"
    pageControls.append(backButton, pageNumbers, nextButton)
    
    if (page == 1 && page == lastPage) {
        backButton.style.display = "none"
        nextButton.style.display = "none";
    } else if (page == 1) {
        backButton.style.display = "none"
    }else if (page == lastPage) {
        nextButton.style.display = "none";
    } else {
        nextButton.style.display = "";
        backButton.style.display = "";
    }
    
}


function renderAdd() {
    clearElement(main)
    clearElement(pageControls)
    main.className = "main-add"

    const newToilet = document.createElement("form")
    newToilet.id = "new-toilet"
    newToilet.innerHTML = `
    <h2>Add New NYC Public Toilet</h4>
    <label for="name">Name:</label><br> 
    <input type="text" id="name" name="name" class="full" placeholder="Add a name/title for this toilet..."><br><br>
    
    <select name="borough" id="borough">
        <option value="Bronx">Bronx</option>
        <option value="Manhattan">Manhattan</option>
        <option value="Brooklyn">Brooklyn</option>
        <option value="Queens">Queens</option>
        <option value="Staten Island">Staten Island</option>
    </select>
    
    <input type="text" id="neighborhood" name="neighborhood" class="semi-full" placeholder="Neighborhood..."><br><br>
    <label for="address">Address:</label><br>
    <input type="text" id="address" name="address" class="full" placeholder="Full Address..."><br><br>
    <label for="location">Specific Location Directions:</label><br>
    <input type="text" id="location" name="location" class="full" placeholder="ie. between first & second ave..."><br><br>
    <label for="image">Image URL:</label><br>
    <input type="text" id="image" name="image" class="full" placeholder="Image URL..."><br><br>
    <input type="checkbox" id="handicap-check" name="handicap" value="false">
    <label for="handicap">Handicap Accessible?</label>
    <input type="checkbox" id="year-check" name="year" value="false">
    <label for="year">Open Year Round?</label><br><br>
    <input type="submit" value="Submit">
    `
    pageControls.innerHTML = `
    <div class="back-to-results"><h3>Back to Results</h3></div>`
    
    main.append(newToilet)
    
}





// ANCHOR Helper Functions
const createNode = (type, content) => {
    let node = document.createElement(type);
    switch (type) {
        case "div":
            node.className = content;
            break
        case "img":
            node.src = content;
            break
        case "option":
            node.innerText = content;
            node.value = content;
            break
        default:
            node.innerText = content;
            break
    }
    return node;
}

const clearElement = parentElement => {
    while (parentElement.firstElementChild) {
        parentElement.firstElementChild.remove()
    }
}

const averageRating = toiletReviews => {
    sum = 0
    toiletReviews.forEach(review => {
        sum += review.rating
    })
    return average = Math.floor(sum / toiletReviews.length)
}

// ANCHOR Initial Render
const loadMainDivContent = () => {
    searched ? searchToilets(filterQuery) : getAllToilets()
}

// ANCHOR Function Calls
loadMainDivContent()
clickListeners()
submitListeners()