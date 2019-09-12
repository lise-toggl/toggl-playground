import React, { Component } from "react";
import axios from "axios";
import DayPicker from "react-day-picker/DayPicker";
import dayjs from "dayjs";
import "react-day-picker/lib/style.css";

export default class WeeklyReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      decimal: false,
      hideAmounts: false,
      apiKey: "",
      userId: "",
      range: [],
      workspaces: [],
      projects: [],
      data: []
    };
  }
  saveApiKey = e => {
    const apiKey = e.target.value;

    this.setState({
      apiKey,
      userId: "",
      range: [],
      workspaces: [],
      projects: [],
      data: []
    });

    if (apiKey) {
      const headers = this.buildHeaders(apiKey);
      console.log(headers);
      axios
        .get("https://www.toggl.com/api/v8/me", {
          headers
        })
        .then(res => {
          const userId = res.data.data.id;

          this.setState({ userId }, () => {
            localStorage.setItem("userId", userId);
          });
        });
      localStorage.setItem("apiKey", apiKey);
    } else {
      localStorage.removeItem("apiKey");
      localStorage.removeItem("userId");
    }
  };
  buildHeaders = (apiKey = this.state.apiKey) => {
    let headers = {
      Authorization: "Basic " + btoa(apiKey + ":api_token"),
      "Content-Type": "application/json"
    };
    return headers;
  };
  getProfileData = async () => {
    const headers = this.buildHeaders();
    let data = [];
    this.setState({ data });

    axios
      .get("https://www.toggl.com/api/v8/me?with_related_data=true", {
        headers
      })
      .then(res => {
        let i = 0;
        this.setState(
          {
            loading: true,
            workspaces: res.data.data.workspaces,
            projects: res.data.data.projects
          },
          () => this.getReportData(0)
        );
      });
  };
  getReportData = i => {
    const headers = this.buildHeaders();
    const ws = this.state.workspaces[i].id;
    const start = dayjs(this.state.range[0]).format("YYYY-MM-DD");
    const end = dayjs(this.state.range.slice(-1)[0]).format("YYYY-MM-DD");

    axios
      .get(
        `https://toggl.com/reports/api/v2/summary?workspace_id=${ws}&user_ids=${
          this.state.userId
        }&since=${start}&until=${end}&user_agent=playground`,
        { headers }
      )
      .then(res => {
        console.log(res.data);
        if (res.data.data.length) {
          const item = {
            workspace: this.state.workspaces[i].name,
            time: res.data.total_grand,
            amount: res.data.total_currencies,
            entries: res.data.data
          };
          this.setState({ data: [...this.state.data, item] });
        }
      });

    setTimeout(() => {
      if (i + 1 < this.state.workspaces.length) {
        this.getReportData(i + 1);
      } else {
        this.setState({ loading: false });
      }
    }, 1000);
  };
  handleToggle = key => {
    this.setState(prevState => ({
      [key]: !prevState[key]
    }));
  };
  handleDayClick = day => {
    let range = [day];

    for (let i = 0; i < 7; i++) {
      range.push(
        dayjs(day)
          .add(i, "day")
          .toDate()
      );
    }
    this.setState({
      range
    });

    this.getProfileData();
  };
  componentDidMount() {
    ["apiKey", "userId"].map(key => {
      if (localStorage.getItem(key)) {
        this.setState({ [key]: localStorage.getItem(key) });
      }
    });
  }
  renderLoader() {
    return (
      <div class="loader"></div>
    );
  }
  renderTime = ms => {
    if (this.state.decimal) {
      return (ms / 3600000).toFixed(2) + " h";
    } else {
      const pad = n => ("0" + n).slice(-2);
      return (
        pad((ms / 3.6e6) | 0) +
        ":" +
        pad(((ms % 3.6e6) / 6e4) | 0) +
        ":" +
        pad(((ms % 6e4) / 1000) | 0)
      );
    }
  };
  renderAmount = amount => {
    if (Array.isArray(amount)) {
      return this.renderAmount(amount[0]);
    } else {
      if (amount.currency) {
        return amount.amount + " " + amount.currency;
      } else {
        return "";
      }
    }
  };
  renderRow = (className, text, time, amount) => {
    return (
      <tr className={className}>
        <td>{text}</td>
        <td>{this.renderTime(time)}</td>
        {!this.state.hideAmounts && <td>{this.renderAmount(amount)}</td>}
      </tr>
    );
  };
  renderTable() {
    return (
      <table className="u-full-width weekly-report">
        <thead>
          <tr>
            <th>
              Workspace > <em>Project</em> > Time Entry
            </th>
            <th>Duration</th>
            {!this.state.hideAmounts && <th>Amount</th>}
          </tr>
        </thead>
        <tbody>
          {this.state.data.map(ws => (
            <>
              {this.renderRow(
                "workspace-row",
                ws.workspace,
                ws.time,
                ws.amount
              )}
              {ws.entries.map(project => (
                <>
                  {this.renderRow(
                    "project-row",
                    project.title.project
                      ? project.title.project
                      : "(No project)",
                    project.time,
                    project.total_currencies
                  )}
                  {project.items.map(entry =>
                    this.renderRow(
                      "entry-row",
                      entry.title.time_entry
                        ? entry.title.time_entry
                        : "(No description)",
                      entry.time,
                      { amount: entry.sum, currency: entry.cur }
                    )
                  )}
                </>
              ))}
            </>
          ))}
        </tbody>
      </table>
    );
  }
  render() {
    return (
      <div>
        <header>
          <h1>Toggl weekly report</h1>
        </header>
        <div className="wrapper">
          <section className="no-print">
            <div className="grid-container thirds">
              <div className="column between">
                <div>
                  <label htmlFor="apiKey">1. Enter API key</label>
                  <input
                    id="apiKey"
                    type="text"
                    placeholder="Paste your API key in here"
                    className="u-full-width"
                    value={this.state.apiKey}
                    onChange={this.saveApiKey}
                  />
                  <p className="note">
                    Your API key is available at the bottom of your{" "}
                    <a href="https://toggl.com/app/profile" target="_blank">
                      Toggl profile page
                    </a>
                    .
                  </p>
                </div>
                {this.state.apiKey &&
                  (this.state.userId ? (
                    <p className="status-green">API key validated ✔️</p>
                  ) : (
                    ""
                  ))}
              </div>
              <div>
                <div>
                  <label htmlFor="preferences">2. Preferences</label>
                  <label className="option">
                    <input
                      type="checkbox"
                      defaultChecked={this.state.decimal}
                      onClick={() => this.handleToggle("decimal")}
                    />
                    <span className="label-body">Decimal durations</span>
                  </label>
                  <label className="option">
                    <input
                      type="checkbox"
                      defaultChecked={this.state.hideAmounts}
                      onClick={() => this.handleToggle("hideAmounts")}
                    />
                    <span className="label-body">Hide amounts</span>
                  </label>
                </div>
              </div>
              <div className={this.state.userId ? "" : "disabled"}>
                <label htmlFor="datePicker">3. Pick start date</label>
                <DayPicker
                  id="datePicker"
                  firstDayOfWeek={1}
                  selectedDays={this.state.range}
                  onDayClick={this.handleDayClick}
                />
              </div>
            </div>
          </section>
          {this.state.range.length > 0 && (
            <section>
              <h5>
                {dayjs(this.state.range[0]).format("YYYY-MM-DD")} -
                {" " +
                  dayjs(this.state.range.slice(-1)[0]).format("YYYY-MM-DD")}
              </h5>
              {this.state.loading
                ? this.renderLoader()
                : this.state.data.length
                  ? this.renderTable()
                  : "No time entries found."}

              <p className="u-align-right">
                Report generated on {dayjs().format("YYYY-MM-DD HH:mm:ss (Z)")}
              </p>
            </section>
          )}
        </div>
      </div>
    );
  }
}
