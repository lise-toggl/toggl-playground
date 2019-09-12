import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home";
import ProjectExport from "./ProjectExport";
import WeeklyReport from "./WeeklyReport";
import "../styles/normalize.css";
import "../styles/barebones.css";
import "../styles/styles.css";

const App = () => (
  <Router>
    <Route path="/projectexport" component={ProjectExport} />
    <Route path="/weeklyreport" component={WeeklyReport} />
    <Route exact path="/" component={Home} />
  </Router>
);

export default App;
