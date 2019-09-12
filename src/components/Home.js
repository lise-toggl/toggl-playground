import React from "react";
import { Link } from "react-router-dom";

const Home = props => (
  <div>
    <h1>Toggl API experiments</h1>
    <ul>
      <li>
        <Link to="/projectexport">Project Export Tool</Link>
      </li>
      <li>
        <Link to="/weeklyreport">Weekly Report Tool</Link>
      </li>
    </ul>
  </div>
);

export default Home;
