import React, { useEffect, useState } from "react";
import { Container, MapTo } from "@adobe/aem-react-editable-components";

const ModalContainer = (props) => {
  const { cqPath } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openContactModal", handler);
    return () => window.removeEventListener("openContactModal", handler);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      {open && <div className="modal-overlay" onClick={close} />}

      <div className={`modal ${open ? "open" : ""}`}>
        <Container cqPath={cqPath} className="modal-content" />
        <button className="modal-close" type="button" onClick={close}>
          Close
        </button>
      </div>
    </>
  );
};

export default MapTo("demo-spa/components/content/modal-container")(ModalContainer);
