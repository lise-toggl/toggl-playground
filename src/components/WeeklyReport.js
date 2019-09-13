import React, { Component } from "react";
import axios from "axios";
import DayPicker from "react-day-picker/DayPicker";
import dayjs from "dayjs";
import "react-day-picker/lib/style.css";
import { loader, formatTime, formatAmount } from "../common/utils";

const ReportRow = ({
  className,
  description,
  time,
  amount,
  decimal,
  hideAmounts
}) => (
  <tr className={className}>
    <td>{description}</td>
    <td>{formatTime(time, decimal)}</td>
    {!hideAmounts && <td>{formatAmount(amount)}</td>}
  </tr>
);

export default class WeeklyReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: "",
      decimal: false,
      hideAmounts: false,
      apiKey: "",
      userId: "",
      range: [],
      workspaces: [],
      data: []
    };
  }
  saveApiKey = e => {
    const apiKey = e.target.value;

    this.setState({
      apiKey,
      userId: "",
      error: "",
      range: [],
      workspaces: [],
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
  getProfileData = () => {
    const headers = this.buildHeaders();
    this.setState({
      loading: true,
      error: "",
      data: [],
      workspaces: []
    });

    axios
      .get("https://www.toggl.com/api/v8/me?with_related_data=true", {
        headers
      })
      .then(res => {
        let i = 0;
        this.setState(
          {
            workspaces: res.data.data.workspaces
          },
          () => this.getReportData(0)
        );
      })
      .catch(error => {
        console.log(error);
        this.setState({ error: error.response });
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
        if (res.data.data.length) {
          const item = {
            workspace: this.state.workspaces[i].name,
            time: res.data.total_grand,
            amount: res.data.total_currencies,
            entries: res.data.data
          };
          this.setState({ data: [...this.state.data, item] });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({ error: error.response });
      });

    setTimeout(() => {
      if (!this.state.error & (i + 1 < this.state.workspaces.length)) {
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
    this.setState({ range });

    this.getProfileData();
  };
  componentDidMount() {
    ["apiKey", "userId"].map(key => {
      if (localStorage.getItem(key)) {
        this.setState({ [key]: localStorage.getItem(key) });
      }
    });
  }
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
          <>{this.renderRows()}</>
        </tbody>
      </table>
    );
  }
  renderRows() {
    const { data: workspaces, decimal, hideAmounts } = this.state;

    const rows = workspaces
      .map(ws =>
        [
          {
            className: "workspace-row",
            description: ws.workspace,
            time: ws.time,
            amount: ws.amount
          }
        ].concat(
          ws.entries.map(project =>
            [
              {
                className: "project-row",
                description: project.title.project || "(No project)",
                time: project.time,
                amount: project.total_currencies
              }
            ].concat(
              project.items.map(entry => ({
                className: "entry-row",
                description: entry.title.time_entry || "(No description)",
                time: entry.time,
                amount: { amount: entry.sum, currency: entry.cur }
              }))
            )
          )
        )
      )
      .flat(2)
      .map((props, i) => (
        <ReportRow
          key={i}
          {...props}
          decimal={decimal}
          hideAmounts={hideAmounts}
        />
      ));

    return rows;
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
              {this.state.error && this.state.error}
              {this.state.loading
                ? loader()
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
