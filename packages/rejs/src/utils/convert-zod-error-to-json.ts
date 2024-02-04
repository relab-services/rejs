import { ZodError } from 'zod'

import { ProblemDetail } from '@/types'

export const convertZodErrorToJson = (error: ZodError, pathPrefix?: string) =>
    error.issues.map<ProblemDetail>(({ path, message }) => {
        const paths = [pathPrefix, ...path].filter((path): path is string | number => path !== undefined)
        return {
            detail: message,
            pointer: paths.length > 0 ? `#/${paths.join('/')}` : '#',
        }
    })
