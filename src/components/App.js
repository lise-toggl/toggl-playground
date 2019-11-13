import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home";
import ProjectExport from "./ProjectExport";
import WeeklyReport from "./WeeklyReport";
import ProjectPubliciser from "./ProjectPubliciser";
import ProjectMakePublic from "./ProjectMakePublic";
import "../styles/normalize.css";
import "../styles/barebones.css";
import "../styles/styles.css";

const App = () => (
  <Router>
    <Route path="/projectexport" component={ProjectExport} />
    <Route path="/weeklyreport" component={WeeklyReport} />
    <Route path="/allprojectspublic" component={ProjectMakePublic} />
    <Route path="/projectpublic" component={ProjectPubliciser} />
    <Route exact path="/" component={Home} />
  </Router>
);

export default App;
