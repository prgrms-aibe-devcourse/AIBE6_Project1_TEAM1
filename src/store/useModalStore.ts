import { create } from 'zustand';

/** 모달의 종류: 단순 알림(alert)인지, 확인/취소 선택(confirm)인지 구분 */
export type ModalType = 'alert' | 'confirm';

/** 모달의 스타일: 기본(primary)인지, 위험/경고(danger)인지 구분 */
export type ModalVariant = 'primary' | 'danger';

/** 모달 하나가 가질 수 있는 모든 정보(상태) 정의 */
export interface ModalState {
  isOpen: boolean;           // 모달이 화면에 보이는지 여부
  type: ModalType;           // 모달의 타입 (alert 또는 confirm)
  variant: ModalVariant;     // 모달의 색상 테마 (primary 또는 danger)
  title: string;              // 모달 제목
  description?: string;       // 모달 본문 내용 (선택사항)
  confirmText?: string;       // 확인 버튼에 들어갈 글자
  cancelText?: string;        // 취소 버튼에 들어갈 글자
  onConfirm?: () => void;     // 확인 버튼을 눌렀을 때 실행할 함수
  onCloseCallback?: () => void; // 모달이 닫힐 때 추가로 실행할 함수 (선택사항)
  inputPlaceholder?: string;  // 입력창을 보여주고 싶을 때 사용하는 힌트 텍스트
  requiredInputText?: string; // 확인 버튼을 활성화하기 위해 입력을 강제하고 싶은 텍스트
}

/** 스토어에서 사용할 함수(액션) 정의 */
interface ModalStore extends ModalState {
  openModal: (config: Omit<ModalState, 'isOpen'>) => void; // 모달을 열 때 사용하는 함수
  closeModal: () => void;                                  // 모달을 닫을 때 사용하는 함수
}

/** 처음 앱이 켜졌을 때의 모달 초기 상태 */
const initialState: ModalState = {
  isOpen: false,
  type: 'alert',
  variant: 'primary',
  title: '',
  description: '',
  confirmText: '확인',
  cancelText: '취소',
  inputPlaceholder: undefined,
  requiredInputText: undefined,
};

/** 모달의 상태를 전역적으로 관리하는 '저장소(Store)' 생성 */
export const useModalStore = create<ModalStore>((set) => ({
  /** 모달을 열고 닫을 때 이전 데이터가 남지 않도록 항상 initialState로 초기화(Reset)합니다. */
  ...initialState,
  /** 외부에서 모달을 열 때 필요한 정보를 받아와서 isOpen을 true로 변경 */
  openModal: (config) => set({ ...initialState, ...config, isOpen: true }),
  /** 모달을 닫을 때 초기 상태로 되돌리되, isOpen만 false로 설정 */
  closeModal: () => set({ ...initialState, isOpen: false }),
}));
