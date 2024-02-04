import cookieParser from 'cookie-parser'
import express, { Express, json, text } from 'express'

import { defaultErrorHandler } from '@/errorHandlers'
import { InitializationError } from '@/exceptions'
import { jsonOutputFormatter } from '@/formatters'
import { OutputFormatter } from '@/types'
import { ErrorHandler, isRoute, isRouter, RejsOptions, Route, Router } from '@/types'
import { normalizeUrlPath } from '@/utils'

export * from './route'

const register = (
    app: Express,
    prefix: string | undefined,
    errorHandler: ErrorHandler,
    formatter: {
        default: OutputFormatter
        formatters: Record<string, OutputFormatter>
    },
    routes: (Route | Router)[]
) => {
    const errors: unknown[] = []

    for (const item of routes) {
        if (isRoute(item)) {
            const { metadata, setup } = item

            try {
                setup(app, prefix, errorHandler, formatter)
            } catch (error) {
                errors.push(error)
            }
        } else if (isRouter(item)) {
            const path = [normalizeUrlPath(prefix), normalizeUrlPath(item.path)].filter((url): url is string => !!url).join('/')
            register(app, path, errorHandler, formatter, item.routes)
        }
    }

    return errors
}

export const rejs = (options: { app: Express } & RejsOptions) => {
    const errors: unknown[] = []

    const { app, ...globalOptions } = options

    app.use(cookieParser())
    app.use(text())
    app.use(json())

    if (options.middlewares) {
        for (const middlewareBundle of options.middlewares) {
            for (const middleware of middlewareBundle(globalOptions)) {
                if (middleware.prefix) {
                    app.use(middleware.prefix, middleware)
                } else {
                    app.use(middleware)
                }
            }
        }
    }

    register(
        app,
        options.prefix,
        globalOptions.errorHandler ?? defaultErrorHandler,
        {
            default: options.defaultFormatter ?? jsonOutputFormatter,
            formatters: options.formatters ?? {},
        },
        options.routes
    )

    if (errors.length > 0) {
        throw new InitializationError(errors)
    }

    return app
}

export const serve = (
    options: {
        port: number
        configure?: (app: Express) => void
    } & RejsOptions,
    callback?: (port: number, app: Express) => void
): Promise<Express> =>
    new Promise<Express>((resolve, reject) => {
        try {
            const app = express()

            options.configure?.(app)

            rejs({
                app,
                ...options,
            })

            app.listen(options.port, () => {
                callback?.(options.port, app)
                resolve(app)
            })
        } catch (e) {
            reject(e)
        }
    })
