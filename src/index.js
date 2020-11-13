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
            renderBoroughDropdown()
            renderNeighborhoodsDropdown(data.neighborhoods)
        })
}
const getToiletById = id => {
    fetch(`http://localhost:3000/api/v1/toilets/${id}`)
    .then(r => r.json())
    .then(renderShowPage)  
}
const patchToilet = (id, body) => {
    fetch(`http://localhost:3000/api/v1/toilets/${id}`,{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    })
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
    return fetch(`http://localhost:3000/api/v1/reviews`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(r => r.json())
}
const deleteReview = (id) => {
    fetch(`http://localhost:3000/api/v1/reviews/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(r => r.json())
    .then(data => {
        console.log(data)
        getToiletById(data.toilet_id)
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
        } else if (e.target.matches(".toilet-show")) {
            getToiletById(e.target.closest("div").dataset.id)
        } else if (e.target.matches("#home-link")) {
            searched = false
            page = 1
            getAllToilets()
        } else if (e.target.matches(".home-img")) {
            searched = false
            page = 1
            getAllToilets()
        } else if (e.target.matches(".back-to-results h2")) {
            loadMainDivContent()
        } else if (e.target.matches("#add-entry")) {
            renderAddToilet()
        } else if (e.target.matches(".delete-button")) {
            removeReview(e)
        } else if (e.target.matches(".fa-heart")) {
            likeToilet(e)
        }
    })
}

const submitListeners = () => {
    document.addEventListener("submit", e => {
        e.preventDefault()
        if (e.target.matches("#new-comment-form")) {
            createPost(e)
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
        } else if (e.target.matches("#borough-dropdown")) {
            filterByBorough(e)
        } else if (e.target.matches("#neighborhood-dropdown")) {
            filterByNeighborhood(e)
        } else if (e.target.matches("#new-toilet")) {
            createToilet(e)
        }
    })
}

// ANCHOR Event Handlers
const likeToilet = e => {
    const id = e.target.dataset.toiletId
    const newlikes = parseInt(e.target.dataset.likes) + 1
    const body = {likes: newlikes}
    patchToilet(id, body)
}

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
    searchToilets(e.target.value)
}

const filterByNeighborhood = e => {
    searched = true
    page = 1
    searchToilets(e.target.value)
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
    .then(review => {
        getToiletById(review.toilet_id)
    })
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

const removeReview = (e) => {
    const reviewDiv = e.target.closest("div")
    const id = parseInt(reviewDiv.dataset.reviewId)
    deleteReview(id)
}

// ANCHOR Render Functions
const renderBoroughDropdown = () => {
    const dropdown = document.querySelector("#borough-dropdown")
    const boroughs = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].sort()
    clearElement(dropdown)
    const defaultOption = createNode("option", "Filter by Borough")
    defaultOption.setAttribute("value", ``)
    defaultOption.setAttribute("disabled", "")
    defaultOption.setAttribute("selected", "")
    defaultOption.setAttribute("hidden", "")
    dropdown.append(defaultOption)
    boroughs.forEach(ele => {
        dropdown.append(createNode("option", ele))
    })
}

const renderNeighborhoodsDropdown = (hoodArray) => {
    const dropdown = document.querySelector("#neighborhood-dropdown")
    clearElement(dropdown)
    const defaultOption = createNode("option", "Filter by Neighborhood")
    defaultOption.setAttribute("value", ``)
    defaultOption.setAttribute("disabled", "")
    defaultOption.setAttribute("selected", "")
    defaultOption.setAttribute("hidden", "")
    dropdown.append(defaultOption)
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
    divContainer.dataset.id = toiletObj.id
    //featured image
    const img = document.createElement("img")
    img.src = toiletObj.image
    img.alt = toiletObj.name
    
    //toilet details
    let name = document.createElement("h1")
    if (toiletObj.handicap_accessible){
        name.innerHTML = `${toiletObj.name} <span class="accent-color"><i class="fab fa-accessible-icon"></i><s/pan>`
    } else {
        name.innerHTML = toiletObj.name
    }
    const address = createNode("p", `<b>Address:</b><br>${toiletObj.address}`)
    const borough = createNode("p", `<b>Borough:</b><br>${toiletObj.borough}`)
    const neighborhood = createNode("p", `<b>Neighborhood:</b><br>${toiletObj.neighborhood}`)
    const location = createNode("p", `<b>Cross Streets:</b><br>${toiletObj.location}`)
    const handicap_accessible = createNode("p", `<b>Handicap Accessible:</b><br>${toiletObj.handicap_accessible}`)
    const open_year_round = createNode("p", `<b>Open Year Round:</b><br>${toiletObj.open_year_round}`)
    //social icons
    const socialDiv = renderSocialIcons(toiletObj)
    //append inner items to inner div container
    divContainer.append(img, name, address, borough, neighborhood, location, open_year_round, socialDiv)
    //append inner div to div container

    const backToResults = document.createElement("div")
    backToResults.className = "back-to-results"
    const backTitle = document.createElement("h2")
    backTitle.className = "clickable"
    backTitle.innerHTML = `
        <i class="fas fa-arrow-alt-circle-left accent-color"></i> Back to Results
    `
    backToResults.append(backTitle)

    toiletDiv.append(divContainer, backToResults)
    main.append(toiletDiv)
    //render the reviews half of the page
    renderReviews(toiletObj)
}

const renderSocialIcons = toiletObj => {
    // social icons container to return
    const socialDiv = document.createElement("div")
    socialDiv.id = "social-icons-div"
    //star rating icons
    const starRating = document.createElement("div")
    starRating.id = "star-rating-div"
    const avgStarRating = averageRating(toiletObj.reviews)
    starRating.innerHTML = renderStarRating(avgStarRating, 5 - avgStarRating)
    //likes count and heart
    const likesDiv = document.createElement("div")
    likesDiv.id = "likes-count-div"
    likesDiv.innerHTML = `<i class="fa fa-heart alt-accent-color " style="font-size: 1.2em" data-toilet-id="${toiletObj.id}" data-likes="${toiletObj.likes}"></i> ${toiletObj.likes}`
    //add likes and stars to social div
    socialDiv.append(likesDiv, starRating)
    return socialDiv
}

const renderStarRating = (checked, unchecked) => {
    let htmlChunk = ''
    for (let i=checked; i>0; i--) { htmlChunk += `<i class="fa fa-star checked" style="font-size: 1.2em"></i>`}
    for (let i=unchecked; i>0; i--) { htmlChunk += `<i class="fa fa-star" style="font-size: 1.2em"></i>`}
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
        
        <select id="rating" name="rating" type="number">
            <option value="" disabled="" selected="" hidden="">Star Rating</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
        </select><br><br>
        <textarea name="message" placeholder="Hey... say something!"></textarea><br><br>
        <input type="submit" value="Submit">
    `
    addReviewDiv.append(heading,form)
    //bottom half of reviews div
    const renderedReviews = document.createElement("div")
    renderedReviews.className = "rendered-reviews"
    //sort reviews by date then render and append
    if (toiletObj.reviews.length !== 0) {
        const sorted = toiletObj.reviews.slice().sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1))
        sorted.forEach(review => {
            const singleReview = renderOneReview(review)
            renderedReviews.append(singleReview)
        })
    }
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
    const title = createNode("h4", `${reviewObj.name} on ${reviewObj.date}`)
    const starRating = document.createElement("div")
    starRating.innerHTML = renderStarRating(reviewObj.rating, 5 - reviewObj.rating)
    const content = createNode("p", `\'${reviewObj.content}\'`)
    //append the review data
    div.append(title, deleteButton, starRating, content)
    //return review card
    return div
}

const renderIndexPage = (toiletObj) => {
    clearElement(main)
    main.className = "main-index"
    toiletObj.forEach(toilet => {
        const divCard = createNode("div", "toilet-card")
        divCard.dataset.id = toilet.id
        const img = createNode("img", toilet.image)
        img.className = "toilet-show"
        let name = document.createElement("h3")
        if (toilet.handicap_accessible){
            name.innerHTML = `${toilet.name}   <i class="fab fa-accessible-icon accent-color"></i>`
        } else {
            name.innerHTML = toilet.name
        }
        name.className = "clickable toilet-show"
        const borough = createNode("p", `<b>Borough:</b><br>${toilet.borough}`)
        const neighborhood = createNode("p", `<b>Neighborhood:</b><br>${toilet.neighborhood}`)
        const address = createNode("p", `<b>Address:</b><br>${toilet.address}`)
        const location = createNode("p", `<b>Specific Location:</b><br>${toilet.location}`)
        const socialIcons = renderSocialIcons(toilet)
        divCard.append(img, name, borough, neighborhood, address, location, socialIcons)
        main.append(divCard)
    })
}

const renderPageControls = (lastPage) => {
    clearElement(pageControls)
    // <i class="fas fa-arrow-alt-circle-left"></i>

    const backButton = document.createElement("button")
    backButton.innerHTML = `<i class="fas fa-angle-left"></i>`
    backButton.addEventListener("click", () => {
        page--
        loadMainDivContent()
    })
    const pageNumbers = createNode("h3", `Page ${page} of ${lastPage}`)

    const nextButton = document.createElement("button")
    nextButton.innerHTML = `<i class="fas fa-angle-right"></i>`
    nextButton.addEventListener("click", () => {
        page++
        loadMainDivContent()
    })

    backButton.className = "page-controls page-control-button"
    pageNumbers.className = "page-controls"
    nextButton.className = "page-controls page-control-button"
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

function renderAddToilet() {
    clearElement(main)
    clearElement(pageControls)
    main.className = "main-add"
    const newToilet = document.createElement("form")
    newToilet.id = "new-toilet"
    newToilet.innerHTML = `
    <h2>Add New NYC Public Toilet</h2>
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
    <div class="back-to-results clickable">
        <h2><i class="fas fa-arrow-alt-circle-left accent-color"></i> Back to Results</h2>
    </div>`
    main.append(newToilet)
}

// ANCHOR Helper Functions
const createNode = (type, content) => {
    let node = document.createElement(type);
    switch (type) {
        case "div":
            node.className = content;
            break
        case "p":
            node.innerHTML = content;
            break
        case "img":
            node.src = content;
            break
        case "option":
            node.innerText = content;
            node.value = content;
            break
        case "button":
            node.innerHTML = content;
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

const pageListeners = () => {
    clickListeners()
    submitListeners()
    changeListeners()
}

// ANCHOR Function Calls
// loadMainDivContent()
getToiletById(7)
pageListeners()