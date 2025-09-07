"use client";

import { FC } from "react";

type CheckoutModalProps = {
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
};

const CheckoutModal: FC<CheckoutModalProps> = ({ total, onConfirm, onCancel, open }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Confirm Checkout</h2>
        <p className="mb-6">Your total is <span className="font-semibold">Ksh {total.toLocaleString()}</span></p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
