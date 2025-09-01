import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ToastStlye = {
  style: {
    background: "#123f73",
    color: "#e5e6ec",
    border: "1px solid #d1d0c5",
  }, // Custom background and text color
};
