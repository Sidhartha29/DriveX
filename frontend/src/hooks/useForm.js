import { useState } from 'react'

export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  return {
    values,
    setValues,
    errors,
    setErrors,
    updateField,
  }
}
