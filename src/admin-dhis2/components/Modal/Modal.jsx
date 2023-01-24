import React from 'react';

// TODO - move this component into component-ui module
const Modal = ({ isOpen, children }) => {
    const showHideClassName = isOpen ? "modal display-block" : "modal display-none";
    
    return (
        <div className={showHideClassName}>
          <section className="modal-main">
            {children}
          </section>
        </div>
    );
}

export default Modal;
