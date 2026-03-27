"use client";

import CommonButton from "@/components/domain/plan/CommonButton";
import { useModalStore } from "@/store/useModalStore";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";

/** 
 * 앱 전체에서 사용되는 전역 모달 컴포넌트입니다.
 * layout.tsx에 하나만 배치되어 있으며, useModalStore의 상태에 따라 나타나거나 사라집니다.
 */
export default function GlobalModal() {
  // 스토어에서 필요한 데이터와 함수들을 가져옵니다.
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

  /** 모달을 닫을 때 실행되는 함수 */
  const handleClose = () => {
    closeModal(); // 스토어의 isOpen 상태를 false로 변경
    if (onCloseCallback) onCloseCallback(); // 별도의 닫기 콜백이 있다면 실행
  };

  /** 확인 버튼을 눌렀을 때 실행되는 함수 */
  const handleConfirm = () => {
    if (onConfirm) onConfirm(); // 전달받은 동작(onConfirm)이 있다면 실행
    closeModal(); // 동작 완료 후 모달 닫기
  };

  return (
    // AnimatePresence: 컴포넌트가 사라질 때의 애니메이션(exit)을 가능하게 합니다.
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={true}
          onClose={handleClose}
          className="relative z-50"
        >
          {/* 어두운 배경(Backdrop)과 배경 블러 효과 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* 모달 콘텐츠 위치 설정: 모바일에서는 아래쪽, 데스크탑에서는 중앙 */}
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
                  
                  {/* 아이콘 표시 영역: danger일 때는 빨간색 느낌표, 그 외에는 파란색 체크 */}
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

                  {/* 텍스트 내용 영역 (제목과 설명) */}
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

                {/* 하단 버튼 영역 */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {/* confirm 타입일 때만 '취소' 버튼을 보여줌 */}
                  {type === "confirm" && (
                    <CommonButton
                      variant="outline"
                      onClick={handleClose}
                      className="w-full sm:w-auto"
                    >
                      {cancelText}
                    </CommonButton>
                  )}
                  {/* '확인' 버튼 (모든 모달에 기본으로 존재) */}
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
