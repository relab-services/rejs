import { ErrorHandler } from './error-handler'
import { OutputFormatter } from './formatters'
import { Middleware } from './middleware'
import { Route, Router } from './router'

export type RejsOptions = {
    prefix?: string
    routes: (Route | Router)[]
    middlewares?: Middleware[]
    formatters?: Record<string, OutputFormatter>
    defaultFormatter?: OutputFormatter
    errorHandler?: ErrorHandler
}
