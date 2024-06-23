import React, { ReactNode, ReactElement, useState } from "react";

interface ModalProps {
  children: ReactNode;
  trigger: ({ openModal }: { openModal: () => void }) => ReactElement;
}

const Modal: React.FC<ModalProps> = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {trigger({ openModal })}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-8 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-lg">
            {children}
            <button
              className="mt-4 text-gray-500 hover:underline"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
