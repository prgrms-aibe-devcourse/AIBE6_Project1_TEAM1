"use client";

import CommonButton from "@/components/domain/plan/CommonButton";
import { useModalStore } from "@/store/useModalStore";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function GlobalModal() {
  const {
    isOpen,
    type,
    variant,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCloseCallback,
    closeModal,
  } = useModalStore();

  const handleClose = () => {
    closeModal();
    if (onCloseCallback) onCloseCallback();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={true}
          onClose={handleClose}
          className="relative z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-end justify-center md:items-center p-0 md:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md"
            >
              <DialogPanel className="w-full overflow-hidden rounded-t-2xl bg-white p-6 text-left align-middle shadow-xl md:rounded-2xl">
                <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:text-left">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      variant === "danger"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {variant === "danger" ? (
                      <AlertCircle className="h-6 w-6" />
                    ) : (
                      <CheckCircle className="h-6 w-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 mt-2 md:mt-0">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900"
                    >
                      {title}
                    </DialogTitle>
                    {description && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 whitespace-pre-line">
                          {description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {type === "confirm" && (
                    <CommonButton
                      variant="outline"
                      onClick={handleClose}
                      className="w-full sm:w-auto"
                    >
                      {cancelText}
                    </CommonButton>
                  )}
                  <CommonButton
                    variant={variant === "danger" ? "danger" : "primary"}
                    onClick={handleConfirm}
                    className="w-full sm:w-auto"
                  >
                    {confirmText}
                  </CommonButton>
                </div>
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
