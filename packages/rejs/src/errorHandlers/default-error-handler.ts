import { ApplicationError } from '@/exceptions'
import { ErrorHandler } from '@/types'

export const defaultErrorHandler: ErrorHandler = (error: unknown) => {
    if (error instanceof ApplicationError) {
        return {
            status: error.status ?? 500,
            message: error.message,
        }
    } else {
        return {
            status: 500,
            message: 'Unhandled error',
        }
    }
}
