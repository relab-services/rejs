import { HttpResponseCode } from './http-response-code'

export type ErrorHandler = (error: unknown) => {
    status: HttpResponseCode
    message?: string
}
