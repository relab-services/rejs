import { Express } from 'express'
import { z } from 'zod'

import { ErrorHandler } from './error-handler'
import { OutputFormatter } from './formatters'
import { Method } from './method'
import { UrlSchema } from './url-schema'

export type RouteSetupHandler = (
    app: Express,
    prefix: string | undefined,
    errorHandler: ErrorHandler,
    formatter: {
        default: OutputFormatter
        formatters: Record<string, OutputFormatter>
    }
) => Express

export type Route<
    Route extends z.ZodObject<any> = z.ZodObject<any>,
    Query extends z.ZodObject<any> = z.ZodObject<any>,
    Body extends z.ZodObject<any> = z.ZodObject<any>,
    Result extends z.ZodType = z.ZodType,
> = {
    metadata: {
        method: Method
        path: UrlSchema
        schema: {
            route?: Route
            query?: Query
            body?: Body
            result?: Result
        }
        metadata?: {
            operationId?: string
            summary?: string
            description?: string
            response?: string
            deprecated?: boolean
            tags?: string[]
        }
    }
    setup: RouteSetupHandler
}

export type Router = {
    path: UrlSchema
    routes: (Route | Router)[]
}

export const isRoute = (source: Route | Router): source is Route => {
    return 'setup' in source
}
export const isRouter = (source: Route | Router): source is Router => {
    return 'routes' in source
}
