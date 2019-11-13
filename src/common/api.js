import axios from "axios";
import debounce from "lodash.debounce";

const getInstance = apiKey =>
  axios.create({
    baseURL: "https://www.toggl.com/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(apiKey + ":api_token")
    }
  });

export default class Api {
  constructor(apiKey) {
    this.setApiToken(apiKey);
  }

  setApiToken(apiKey) {
    this.instance = getInstance(apiKey);
  }

  async get(url) {
    let data = await this.instance
      .get(url)
      .then(res => res.data)
      .catch(function(error) {
        console.log(error);
      });
    return data;
    // return new Promise((resolve) => {
    //   debounce(
    //     () => this.instance.get(url),
    //     1000
    //   )
    // });
  }

  async put(url, input) {
    let data = await this.instance
      .put(url, input)
      .then(res => res.data)
      .catch(function(error) {
        console.log(error);
      });
  }

  async patch(url, input) {
    let data = await this.instance
      .patch(url, input)
      .then(res => res.data)
      .catch(function(error) {
        console.log(error);
      });
  }
}
