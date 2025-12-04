import React from "react";
import { Container, MapTo } from "@adobe/aem-react-editable-components";

const Header = (props) => {
  const { cqPath } = props;

  const openModal = () => {
    window.dispatchEvent(new Event("openContactModal"));
  };

  return (
    <header className="header">
      <div className="logo">Demo SPA</div>

      {/* Render children inside header, including modal-container */}
      <Container cqPath={cqPath} />

      <button className="btn-contact" type="button" onClick={openModal}>
        Contact Us
      </button>
    </header>
  );
};

export default MapTo("demo-spa/components/content/header")(Header);
