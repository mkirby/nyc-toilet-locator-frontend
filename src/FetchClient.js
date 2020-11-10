class FetchClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      "Content-Type": "application/json"
    }
  }

  get(endpoint) {
    return this.fetchAndParse(this.baseUrl + endpoint + urlEnd)
  }

  delete(endpoint) {
    return this.fetchAndParse(this.baseUrl + endpoint, {
      method: "DELETE"
    })
  }

  patch(endpoint, data) {
    return this.fetchAndParse(this.baseUrl + endpoint, {
      method: "PATCH",
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    })
  }

  post(endpoint, data) {
    return this.fetchAndParse(this.baseUrl + endpoint, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    })
  }

  fetchAndParse(url, config) {
    return fetch(url, config).then(r => r.json())
  }
}

const baseUrl = "http://localhost:3000/api/v1"
const urlEnd = `?_limit=8&page=1`

const client = new FetchClient(baseUrl)

export { client }