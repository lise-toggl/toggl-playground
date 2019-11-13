import React, { Component } from "react";
import Bottleneck from "bottleneck";
import Api from "../common/api";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000
});

let TOGGL_API;

export default class ProjectMakePublic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      working: false,
      apiKey: "",
      workspaces: [],
      ws: 0,
      projects: [],
      progress: 0
    };
  }
  saveApiKey = e => {
    const apiKey = e.target ? e.target.value : e;

    this.setState({ apiKey, ready: false });
    if (apiKey) {
      localStorage.setItem("apiKey", apiKey);
      TOGGL_API = new Api(apiKey);
      limiter.schedule(() => TOGGL_API.get("v8/workspaces")).then(res => {
        const workspaces = res.filter(ws => ws.admin);
        this.setState({ workspaces });
      });
    } else {
      localStorage.removeItem("apiKey");
      this.setState({ workspaces: [] });
    }
  };
  getProjects = async ws => {
    this.setState({ ws, projects: [], ready: false, working: false });

    const project_data = await limiter.schedule(() =>
      TOGGL_API.get(`v8/workspaces/${ws}/projects`)
    );
    const client_data = await limiter.schedule(() =>
      TOGGL_API.get(`v8/workspaces/${ws}/clients`)
    );

    let projects = [];
    if (project_data != null) {
      project_data.forEach(i => {
        if (i.is_private) {
          let project = {
            id: i.id,
            name: i.name
          };
          if ("cid" in i) {
            project.client = client_data.find(x => x.id === i.cid).name;
          } else {
            project.client = "(No client)";
          }
          projects.push(project);
        }
      });
    }
    this.setState({ projects, progress: 0, ready: true });
  };
  makePublic = () => {
    this.setState({ working: true });
    this.state.projects.forEach(project => {
      limiter
        .schedule(() => TOGGL_API.put(`v8/projects/${project.id}`, {"project":{"is_private":false}}))
        .then(res => {
          console.log(res);
          this.setState(
            prevState => ({
              progress: prevState.progress + 1
            }),
            () => {
              if (this.state.progress == this.state.projects.length) {
                setTimeout(() => this.getProjects(this.state.ws), 3000);
              }
            }
          );
        });
    });
  };
  componentDidMount() {
    if (localStorage.getItem("apiKey")) {
      this.saveApiKey(localStorage.getItem("apiKey"));
    }
  }
  renderProgress() {
    return (
      <>
        {this.state.working && "Working... "}
        {this.state.progress + " / " + this.state.projects.length}
        {!this.state.working && " DONE!"}
      </>
    );
  }
  renderAction() {
    return (
      <div className="action">
        {this.state.projects.length > 0 ? (
          <button
            className={this.state.working ? "button-primary" : ""}
            onClick={this.makePublic}
          >
            {this.state.working
              ? this.renderProgress()
              : "I'm really, really sure about this"}
          </button>
        ) : (
          "There aren't any private projects in here!"
        )}
      </div>
    );
  }
  render() {
    return (
      <div>
        <header>
          <h1>Make all Toggl projects public</h1>
        </header>
        <div className="wrapper">
          <h3>Important notes</h3>
          <ul>
            <li>Everyone can see everyone else's time in a public project.</li>
            <li>
              This will make <em>all</em> your projects in your selected Toggl
              workspace public.
            </li>
            <li>
              <strong>You cannot stop the process after it starts!</strong>
            </li>
            <li>
              <strong>There is no way to undo this!</strong>
            </li>
            <li>
              You must be an <strong>admin</strong> user for this to work.
            </li>
          </ul>
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
                  <button
                    key={id}
                    className={ws.id == this.state.ws ? "button-primary" : ""}
                    onClick={() => this.getProjects(ws.id)}
                  >
                    {ws.name}
                  </button>
                ))}
              </div>
            )}
          </section>
          <section>
            <h4>3. Make your private projects public</h4>
            {this.state.ready
              ? this.renderAction()
              : "Pick your workspace and wait for your private projects to load."}
            {this.state.projects.length > 0 && (
              <ul>
                {this.state.projects.map((project, id) => (
                  <li key={id}>{project.name + " - " + project.client}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    );
  }
}
