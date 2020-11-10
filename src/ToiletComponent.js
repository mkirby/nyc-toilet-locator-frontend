import { client } from './FetchClient.js'

class ToiletComponent {
  constructor(toiletObj) {
    this.restroom = toiletObj
  }

  findChildElement(selector) {
    return this.element.querySelector(selector)
  }

  renderCard(parentElement) {
    this.element = document.createElement("div")
    this.element.classList.add("toilet-card")
    
    const h3 = document.createElement("h3")
    h3.textContent = this.toilet.name

    const p = document.createElement("p")
    p.textContent = this.toilet.location

    this.element.append(h3, p)
    parentElement.append(this.element)
  }
}

export default ToiletComponent