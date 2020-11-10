import { client } from "./FetchClient.js"

const main = document.querySelector("main")

const initialize = () => {
  client.get("/toilets")
    .then(toiletArray => {
      toiletArray.forEach(toiletObj => {
        const toiletComponent = new ToiletComponent(toiletObj)
        toiletComponent.render(main)
      })
    })
}

initialize()