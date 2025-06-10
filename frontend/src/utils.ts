import type { ApiError } from "./client"
import useCustomToast from "./hooks/useCustomToast"

// 邮箱校验规则
export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "请输入有效的邮箱地址",
}

// 名称校验规则
export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "请输入有效的姓名",
}

// 密码规则
export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: "密码长度至少为8位",
    },
  }

  if (isRequired) {
    rules.required = "请输入密码"
  }

  return rules
}

// 确认密码规则
export const confirmPasswordRules = (
  getValues: () => any,
  isRequired = true,
) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : "两次输入的密码不一致"
    },
  }

  if (isRequired) {
    rules.required = "请再次输入密码"
  }

  return rules
}

// 统一错误处理
export const handleError = (err: ApiError) => {
  const { showErrorToast } = useCustomToast()
  const errDetail = (err.body as any)?.detail
  let errorMessage = errDetail || "发生未知错误，请稍后重试。"
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  showErrorToast(errorMessage)
}
