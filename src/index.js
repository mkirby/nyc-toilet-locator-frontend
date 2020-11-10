// ANCHOR DOM Elements
const main = document.querySelector("#main-content-div")
const pageControls = document.querySelector("#bottom-div")
let page = 1

// ANCHOR Fetch Functions
const getToilet = id => {
    fetch(`http://localhost:3000/api/v1/toilets/${id}`)
    .then(r => r.json())
    .then(renderShowPage)
}
const postReview = () => {
    fetch()
    .then(r => r.json())
    .then()
}

// ANCHOR Event Listeners
const clickListeners = () => {
    document.addEventListener("click", e => {
        //if user clicks "Restrooms Near Me" button
        if (e.target.matches("#filter-near-me button")) {
            geolocateUser(e)
        } else if (e.target.matches(".toilet-card")) {
            // TODO not accurate enough if you click elements inside
            //the container the link doesn't work
            getToilet(e.target.dataset.id)
        } else if (e.target.matches("#home-link")) {
            //click home load index page
            // page = 1
            init()
        }
    })
}

const submitListeners = () => {
    document.addEventListener("submit", e =>{
        e.preventDefault()
        if (e.target.matches("#new-comment-form")) {
            console.log(e.target)
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
const renderShowPage = (toiletObj) => {
    //clear the main container and page controls
    main.innerHTML = ""
    pageControls.innerHTML = ""
    //clear any other classNames on the main container
    main.className = ""
    //assign the correct class
    main.classList.add("main-show")
    //show toilet half of the main container div
    const toiletDiv = document.createElement("div")
    toiletDiv.id = "toilet-div"
    // contain the toilet card
    const divContainer = createNode("div", "selected-toilet")
    //featured image
    const img = document.createElement("img")
    img.src = "https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png"
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
    toiletDiv.append(divContainer)
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
    form.innerHTML = `
        <input type="text" id="username" name="username" placeholder="Name">
        <label for="rating">Star Rating:</label>
        <select id="rating" name="rating">
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
    //render each comment and append
    toiletObj.reviews.forEach(review => {
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
    // create the review data
    const title = createNode("h5", `${reviewObj.name} on ${reviewObj.date}`)
    const starRating = document.createElement("div")
    starRating.innerHTML = renderStarRating(reviewObj.rating, 5 - reviewObj.rating)
    const content = createNode("p", `\'${reviewObj.content}\'`)
    //append the review data
    div.append(title, starRating, content)
    //return review card
    return div
}

renderIndex = (array) => {
    //clear the main container
    main.innerHTML = ''
    //clear any other classNames on the main container
    main.className = ""
    //assign the correct class
    main.classList.add("main-index")

    // while (main.querySelector(".toilet-card")) {
    //     main.querySelector(".toilet-card").remove()
    // }
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

function renderPageControls(maxPage) {
    while (pageControls.firstElementChild) {
        pageControls.firstElementChild.remove()
    }
    const backButton = createNode("button", "<")
    backButton.addEventListener("click", () => {
        page--
        init()
    })
    const pageNumbers = createNode("p", `Page ${page} of ${maxPage}`)

    const nextButton = createNode("button", ">")
    nextButton.addEventListener("click", () => {
        page++
        init()
    })

    backButton.className = "page-controls"
    pageNumbers.className = "page-controls"
    nextButton.className = "page-controls"
    pageControls.append(backButton, pageNumbers, nextButton)
    
    if (page == 1) {
        backButton.style.display = "none"
    } else if (page == maxPage) {
        nextButton.style.display = "none";
    } else {
        nextButton.style.display = "";
        backButton.style.display = "";
    }
    
}

// ANCHOR Helper Functions
createNode = (type, content) => {
    let node = document.createElement(type);
    switch (type) {
        case "h3":
            node.innerText = content;
            break
        case "p":
            node.innerText = content;
            break
        case "button":
            node.innerText = content;
            break
        case "div":
            node.className = content;
            break
        case "h4":
            node.innerText = content;
            break
        case "h5":
                node.innerText = content;
                break
    }
    return node;
}

function getMaxPage() {
    return fetch("http://localhost:3000/api/v1/info")
    .then(r => r.json())
}

// ANCHOR Initial Render
function init() {
    let maxPage
    getMaxPage().then(data => maxPage = data)
    fetch(`http://localhost:3000/api/v1/toilets?page=${page}`)
        .then(r => r.json())
        .then(data => {
            renderIndex(data)
            renderPageControls(maxPage)
        })
}

// ANCHOR Function Calls
init()
clickListeners()
submitListeners()
// getToilet(167)

