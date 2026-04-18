import { useMemo } from 'react'
import { ROLE_THEME, ROLES } from '../utils/constants'

export const useRoleTheme = (role) =>
  useMemo(() => {
    if (!role || !ROLE_THEME[role]) {
      return ROLE_THEME[ROLES.CUSTOMER]
    }

    return ROLE_THEME[role]
  }, [role])
