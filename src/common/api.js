import axios from 'axios';
import debounce from 'lodash.debounce';

const getInstance = apiKey => axios.create({
  baseURL: 'https://www.toggl.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': "Basic " + btoa(apiKey + ":api_token")
  }
});

class Api {
  constructor(apiKey) {
    this.setApiToken(apiKey);
  }
  
  setApiToken(apiKey) {
    this.instance = getInstance(apiKey);
  }
  
  get(url) {
    return new Promise((resolve) => {
      debounce(
        () => this.instance.get(url),
        1000
      )
    });
  }
}

export default Api;