import React from "react";

const NotificationAlert = ({
  isOpen,
  message,
  type = "alert",          // "alert" | "confirm" | "auth"
  onConfirm,
  onCancel,
  cancelLabel,             // optional custom text
  confirmLabel             // optional custom text
}) => {
  if (!isOpen) return null;

  /* default labels by type  */
  const labels = {
    alert:  { confirm: confirmLabel || "OK" },
    confirm:{ cancel: cancelLabel  || "Cancel",
              confirm: confirmLabel || "Delete" },
    auth:   { cancel: cancelLabel  || "Not now",
              confirm: confirmLabel || "Sign In" }
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <p className="text-gray-800 text-lg mb-5">{message}</p>

        <div className="flex justify-end gap-3">
          {/* cancel button if present */}
          {labels.cancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              {labels.cancel}
            </button>
          )}

          {/* confirm button */}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${
              type === "confirm"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationAlert;
