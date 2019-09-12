import React, { Component } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

const COLUMNS = [
  "Project",
  "Client",
  "Hours",
  "Active",
  "Billable",
  "Updated",
  "Created"
];

export default class ProjectExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      apiKey: "",
      workspaces: [],
      projects: [COLUMNS]
    };
  }
  saveApiKey = e => {
    const apiKey = e.target.value;

    this.setState({ apiKey, ready: false });
    if (apiKey) {
      localStorage.setItem("apiKey", apiKey);
    } else {
      localStorage.removeItem("apiKey");
    }
  };
  buildHeaders = () => {
    let headers = {
      Authorization: "Basic " + btoa(this.state.apiKey + ":api_token"),
      "Content-Type": "application/json"
    };
    return headers;
  };
  fetchData = (url, key) => {
    const headers = this.buildHeaders();
    axios
      .get(url, {
        headers
      })
      .then(res => {
        this.setState({ [key]: res.data });
      });
  };
  getProjects = async ws => {
    this.setState({ projects: [COLUMNS], ready: false });
    const headers = this.buildHeaders();

    let projects = axios.get(
      `https://www.toggl.com/api/v8/workspaces/${ws}/projects?active=both&actual_hours=true`,
      { headers }
    );
    let clients = axios.get(
      `https://www.toggl.com/api/v8/workspaces/${ws}/clients`,
      { headers }
    );

    Promise.all([projects, clients]).then(res => {
      projects = res[0].data;
      clients = res[1].data;
      let data = [COLUMNS];

      if (projects.length > 0) {
        projects.forEach(i => {
          let project = [
            i.name,
            i.cid ? "" : "No client",
            i.actual_hours | 0,
            i.active ? "Yes" : "No",
            i.billable ? "Yes" : "No",
            i.at.substring(0, 10),
            i.created_at.substring(0, 10)
          ];
          if ("cid" in i) {
            project[1] = clients.find(x => x.id === i.cid).name;
          }
          data.push(project);
        });
      }

      if (clients.length > 0) {
        console.log(clients);
        clients.forEach(i => {
          if (!projects.find(x => x.cid === i.id)) {
            data.push([
              "No project",
              i.name,
              "",
              "",
              "",
              "",
              i.at.substring(0, 10)
            ]);
          }
        });
      }
      this.setState({ projects: data, ready: true });
    });
  };
  componentDidUpdate(_, prevState) {
    if (prevState.apiKey != this.state.apiKey) {
      if (this.state.apiKey) {
        this.fetchData("https://www.toggl.com/api/v8/workspaces", "workspaces");
      } else {
        console.log("clearing workspaces");
        this.setState({ workspaces: [] }, () => console.log(this.state));
      }
    }
  }
  componentDidMount() {
    if (localStorage.getItem("apiKey")) {
      this.setState({ apiKey: localStorage.getItem("apiKey") });
    }
  }
  render() {
    return (
      <div>
        <header>
          <h1>Export Toggl projects</h1>
        </header>
        <div className="wrapper">
          <p>
            Note: You must be an <b>admin</b> in the workspace to get all
            projects!
          </p>
          <section>
            <h4>1. Enter your API key</h4>
            <p>
              You can get your API key from the bottom of your Profile page.
            </p>
            <div>
              <input
                id="apiKey"
                className="u-full-width"
                type="text"
                placeholder="Paste your API key in here"
                value={this.state.apiKey}
                onChange={this.saveApiKey}
              />
            </div>
          </section>
          <section>
            <h4>2. Choose a workspace</h4>
            {!this.state.workspaces.length && "Please put in a valid API key!"}
            {this.state.workspaces.length > 0 && (
              <div className="buttons">
                {this.state.workspaces.map((ws, id) => (
                  <button key={id} onClick={() => this.getProjects(ws.id)}>
                    {ws.name}
                  </button>
                ))}
              </div>
            )}
          </section>
          <section>
            <h4>3. Download projects (CSV)</h4>
            {this.state.ready ? 
              <CSVLink filename={"toggl-projects.csv"} data={this.state.projects} enclosingCharacter={``}>
                Click here to download
              </CSVLink> : "Nothing to download yet!"}
          </section>
        </div>
      </div>
    );
  }
}
