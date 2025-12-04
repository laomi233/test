import React from "react";
import ReactDOM from "react-dom";
import { ModelManager, Page } from "@adobe/aem-react-editable-components";

import "./styles/modal.css";

// Import components so that MapTo registrations execute
import "./components/Header";
import "./components/ModalContainer";
import "./components/ContactModal";

class App extends React.Component {
  render() {
    const { model } = this.props;
    return (
      <Page
        cqChildren={model[":children"]}
        cqItems={model[":items"]}
        cqItemsOrder={model[":itemsOrder"]}
        cqPath={model[":path"]}
      />
    );
  }
}

function render(model) {
  const root = document.getElementById("spa-root");
  if (!root) {
    console.error("spa-root element not found");
    return;
  }

  ReactDOM.render(<App model={model} />, root);
}

ModelManager.initialize().then(render);
