"use client";

import { Transition, TransitionChild } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  show?: boolean; // 알림 표시 여부를 외부에서 제어할 수 있도록 추가
}

export default function Alert({ children, show = true }: AlertProps) {
  return (
    <Transition appear show={show} as={Fragment}>
      <div className="fixed left-0 right-0 top-0 z-50 flex justify-center p-4">
        <TransitionChild
          as={Fragment}
          enter="transition-all duration-500 ease-out"
          enterFrom="opacity-0 -translate-y-full"
          enterTo="opacity-100 translate-y-0"
          leave="transition-all duration-300 ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-full"
        >
          <div className="w-full max-w-md">{children}</div>
        </TransitionChild>
      </div>
    </Transition>
  );
}
