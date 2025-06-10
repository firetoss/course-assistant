"use client"

import { toaster } from "@/components/ui/toaster"

const useCustomToast = () => {
  const showSuccessToast = (description: string) => {
    toaster.create({
      title: "操作成功！",
      description,
      type: "success",
    })
  }

  const showErrorToast = (description: string) => {
    toaster.create({
      title: "发生错误！",
      description,
      type: "error",
    })
  }

  return { showSuccessToast, showErrorToast }
}

export default useCustomToast
