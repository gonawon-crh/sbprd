import { create } from 'zustand';

interface UserInfo {
  gender: 'male' | 'female';
  birthDate: string;
  workStartDate: string;
}

interface PaymentRecord {
  year: number;
  socialAverageSalary: number;
  paymentMonths: number;
  monthlySalary: number;
  yearlyPayment: number;
  paymentIndex: number;
}

interface Store {
  userInfo: UserInfo;
  paymentRecords: PaymentRecord[];
  setUserInfo: (info: UserInfo) => void;
  setPaymentRecords: (records: PaymentRecord[]) => void;
  clearAll: () => void;
}

const initialUserInfo: UserInfo = {
  gender: 'male',
  birthDate: '1981-10',
  workStartDate: '2004-07',
};

export const useStore = create<Store>((set) => ({
  userInfo: initialUserInfo,
  paymentRecords: [],
  setUserInfo: (info) => set({ userInfo: info }),
  setPaymentRecords: (records) => set({ paymentRecords: records }),
  clearAll: () => set({ userInfo: initialUserInfo, paymentRecords: [] }),
}));