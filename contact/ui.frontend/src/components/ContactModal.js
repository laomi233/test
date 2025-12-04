import React from "react";
import { MapTo, withModel } from "@adobe/aem-react-editable-components";

const ContactModal = (props) => {
  const { title, message } = props;
  return (
    <div className="contact-modal-inner">
      <h2>{title || "Contact Us"}</h2>
      <p>{message || "Please fill in the form or contact us at xxx."}</p>
    </div>
  );
};

const EditConfig = {
  emptyLabel: "Contact Modal",
  isEmpty: (props) => !props || (!props.title && !props.message),
};

export default MapTo("demo-spa/components/content/contact-modal")(
  withModel(ContactModal),
  EditConfig
);
