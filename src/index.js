import { client } from "./FetchClient.js"

let page = 1;

const main = document.querySelector("main")

const initialize = () => {
  client.get("/toilets")
    .then(toiletArray => {
      toiletArray.forEach(toiletObj => {
        const toiletComponent = new ToiletComponent(toiletObj)
        toiletComponent.renderCard(main)
      })
    })
}

function getMaxPage() {
    fetch(`http://localhost:3000/monsters`)
        .then(response => response.json())
        .then(data => {
            return lastPage = Math.ceil(data.length / 8 )
        })
}

// initialize()