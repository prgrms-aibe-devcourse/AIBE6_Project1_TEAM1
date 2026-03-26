import { create } from 'zustand';

export type ModalType = 'alert' | 'confirm';
export type ModalVariant = 'primary' | 'danger';

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  variant: ModalVariant;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCloseCallback?: () => void;
}

interface ModalStore extends ModalState {
  openModal: (config: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
}

const initialState: ModalState = {
  isOpen: false,
  type: 'alert',
  variant: 'primary',
  title: '',
  description: '',
  confirmText: '확인',
  cancelText: '취소',
};

export const useModalStore = create<ModalStore>((set) => ({
  ...initialState,
  openModal: (config) => set({ ...config, isOpen: true }),
  closeModal: () => set((state) => ({ ...initialState, isOpen: false })),
}));
