export const loginPattern = /^[A-Za-z0-9]+$/
export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
export const fullNamePattern = /^[А-Яа-яЁё]+(?:[ -][А-Яа-яЁё]+)*$/
export const phonePattern = /^8\d{10}$/

export const getFieldError = (fieldName, value) => {
  switch (fieldName) {
    case "login":
      return loginPattern.test(value) ? "" : "Некорректный логин"
    case "password":
      return passwordPattern.test(value)
        ? ""
        : "Пароль должен быть не менее 6 символов и иметь цифры и буквы"
    case "fullName":
      return fullNamePattern.test(value) ? "" : "Только кириллица, пробел и дефис"
    case "phone":
      return phonePattern.test(value) ? "" : "Некорректный телефон"
    default:
      return ""
  }
}
