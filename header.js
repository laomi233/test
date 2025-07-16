// Header.jsx
import React, { useState } from "react";
import "./Header.css";

const Header = () => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  return (
    <header className="header">
      <div className="logo"> {/* Replace with your logo image */}
        <img src="/logo.png" alt="Logo" height={40} />
      </div>
      <nav className="nav">
        <a href="#">Indexes</a>
        <div
          className="nav-item"
          onMouseEnter={() => setShowMegaMenu(true)}
          onMouseLeave={() => setShowMegaMenu(false)}
        >
          <a href="#">Solutions</a>
          {showMegaMenu && (
            <div className="mega-menu">
              <div className="mega-menu-column">
                <h4>SUSTAINABILITY</h4>
                <a href="#">Sustainability Solutions</a>
                <a href="#">ESG Rating Model</a>
                <a href="#">Search Company ESG Rating</a>
                <a href="#">ESG Insights</a>
                <h4>CUSTOM SOLUTION</h4>
                <a href="#">Customised Index Solutions</a>
              </div>
              <div className="mega-menu-column">
                <h4>FACTOR</h4>
                <a href="#">Factor Investing</a>
                <a href="#">Single Factor Approach</a>
                <a href="#">Multi Factor Approach</a>
                <a href="#">Factor Index Performances</a>
                <h4>LICENSING</h4>
                <a href="#">Index Licensing</a>
              </div>
              <div className="mega-menu-column">
                <h4>DATA</h4>
                <a href="#">Data Dissemination</a>
                <a href="#">Data Product Service</a>
                <a href="#">Historical Data</a>
                <h4>ANALYTICS</h4>
                <a href="#">Hang Seng INdexLab</a>
              </div>
              <div className="mega-menu-image">
                <img src="/menu-image.png" alt="Discover Hang Seng INdexLab" />
                <button>Discover Hang Seng INdexLab</button>
              </div>
            </div>
          )}
        </div>
        <a href="#">Insights & Reports</a>
        <a href="#">Media Room</a>
        <a href="#">INdex360</a>
      </nav>
    </header>
  );
};

export default Header;
