"use client";

import { ReactNode, useState } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        {/* Header */}
        {title && (
          <div className="sticky top-0 border-b bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
