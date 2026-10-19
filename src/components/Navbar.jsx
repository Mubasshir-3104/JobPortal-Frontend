import React from "react";
import { NavLink } from "react-router-dom";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AddIcon from "@mui/icons-material/Add";

// NOTE: Navbar relies on react-router's <NavLink>, so it must be rendered
// inside <BrowserRouter> (see App.js).
const Navbar = () => {
  const linkClass = ({ isActive }) =>
    `navbar__link${isActive ? " navbar__link--active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="brand" aria-label="JobPortal home">
          <span className="brand__mark">
            <WorkOutlineIcon fontSize="small" />
          </span>
          <span className="brand__name">
            Job<span>Portal</span>
          </span>
        </NavLink>

        <nav className="navbar__links" aria-label="Primary">
          <NavLink to="/" end className={linkClass}>
            Find Jobs
          </NavLink>
          <a
            className="navbar__link"
            href="http://localhost:3000/"
          >
            Contact Us
          </a>
        </nav>

        <NavLink to="/create" className="btn btn--primary navbar__cta">
          <AddIcon />
          <span>
            Post<span className="navbar__cta-long"> a Job</span>
          </span>
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;