const main = document.querySelector("main")

init = () => {
    fetch("http://localhost:3000/api/v1/toilets?page=1")
    .then(r => r.json())
    .then(data => renderIndex(data))
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


init()