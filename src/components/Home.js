import React from "react";
import { Link } from "react-router-dom";

const Home = props => (
  <div>
    <header>
      <h1>Toggl API experiments</h1>
    </header>
    <div className="wrapper">
      <ul>
        <li>
          <Link to="/projectexport">Project Export Tool</Link>
        </li>
        <li>
          <Link to="/weeklyreport">Weekly Report Tool</Link>
        </li>
        <li>
          <Link to="/allprojectspublic">Make All Projects Public Tool</Link>
        </li>
      </ul>
    </div>
  </div>
);

export default Home;
