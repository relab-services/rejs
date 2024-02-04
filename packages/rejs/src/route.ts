import { z } from 'zod'

import {
    EnsureBodyProp,
    HandlerParams,
    InferParam,
    InferResult,
    Method,
    OutputFormatter,
    ProblemDetail,
    RequestContext,
    RouteSetupHandler,
    UrlSchema,
} from '@/types'
import { convertZodErrorToJson, normalizeUrlPath, parseAcceptHeader } from '@/utils'

export const route = <
    M extends Method,
    // Schema types
    Route extends z.ZodObject<any>,
    Query extends z.ZodObject<any>,
    Body extends z.ZodObject<any>,
    Headers extends z.ZodObject<any>,
    Cookies extends z.ZodObject<any>,
    Result extends z.ZodType,
    // Schema
    SchemaOptions extends EnsureBodyProp<
        M,
        {
            route?: Route
            query?: Query
            body?: Body
            result?: Result
            headers?: Headers
            cookies?: Cookies
        }
    >,
    // Parameters
    RouteSchema extends InferParam<SchemaOptions['route']>,
    QuerySchema extends InferParam<SchemaOptions['query']>,
    BodySchema extends SchemaOptions extends { body?: Body } ? InferParam<SchemaOptions['body']> : never,
    HeadersSchema extends InferParam<SchemaOptions['headers']>,
    CookiesSchema extends InferParam<SchemaOptions['cookies']>,
    HandlerParameter extends HandlerParams<
        EnsureBodyProp<
            M,
            {
                route: RouteSchema
                query: QuerySchema
                body: BodySchema
                headers: HeadersSchema
                cookies: CookiesSchema
            }
        >
    >,
    HandlerResult extends InferResult<SchemaOptions['result']>,
>(options: {
    method: M
    path: UrlSchema
    schema: SchemaOptions
    metadata?: {
        operationId?: string
        summary?: string
        description?: string
        response?: string
        deprecated?: boolean
        tags?: string[]
    }
}): ((handler: (request: HandlerParameter, context: RequestContext) => HandlerResult) => {
    metadata: {
        method: M
        path: UrlSchema
        schema: SchemaOptions
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
}) => {
    const routePath = normalizeUrlPath(options.path)
    return (handler: (request: HandlerParameter, context: RequestContext) => HandlerResult) => ({
        metadata: {
            method: options.method,
            path: `/${routePath}`,
            schema: options.schema,
            metadata: options.metadata,
        },
        setup: (app, prefix, errorHandler, formatter) => {
            const express = app[options.method.toLowerCase() as Lowercase<Method>].bind(app)

            const routePrefix = normalizeUrlPath(prefix)

            return express(`/${routePrefix ? `${routePrefix}/` : ''}${routePath}`, async (req, res) => {
                const parsedRequest = {
                    route: options.schema.route?.safeParse(req.params),
                    query: options.schema.query?.safeParse(req.query),
                    body: 'body' in options.schema ? options.schema.body?.safeParse(req.body) : undefined,
                    headers: options.schema.headers?.safeParse(req.headers),
                    cookies: options.schema.cookies?.safeParse(req.cookies),
                }

                const handlerParams: Partial<Record<keyof typeof parsedRequest, any>> = {}
                const errors: ProblemDetail[] = []

                if (parsedRequest.route?.success) handlerParams.route = parsedRequest.route.data
                else if (parsedRequest.route !== undefined) errors.push(...convertZodErrorToJson(parsedRequest.route.error, 'url'))

                if (parsedRequest.query?.success) handlerParams.query = parsedRequest.query.data
                else if (parsedRequest.query !== undefined) errors.push(...convertZodErrorToJson(parsedRequest.query.error, 'query'))

                if (parsedRequest.body?.success) handlerParams.body = parsedRequest.body.data
                else if (parsedRequest.body !== undefined) errors.push(...convertZodErrorToJson(parsedRequest.body.error, 'body'))

                if (parsedRequest.headers?.success) handlerParams.headers = parsedRequest.headers.data
                else if (parsedRequest.headers !== undefined) errors.push(...convertZodErrorToJson(parsedRequest.headers.error, 'headers'))

                if (parsedRequest.cookies?.success) handlerParams.cookies = parsedRequest.cookies.data
                else if (parsedRequest.cookies !== undefined) errors.push(...convertZodErrorToJson(parsedRequest.cookies.error, 'cookies'))

                if (errors.length > 0) {
                    res.status(400).send({
                        title: 'Validation Error',
                        errors,
                    })
                } else {
                    try {
                        const context: RequestContext = { status: 200 }

                        // eslint-disable-next-line @typescript-eslint/await-thenable
                        const result = await handler(handlerParams as HandlerParameter, context)

                        let outputFormatter: OutputFormatter | undefined
                        for (const accept of parseAcceptHeader(req.header('accept'))) {
                            outputFormatter = formatter.formatters[accept]
                            if (outputFormatter) break
                        }
                        outputFormatter = outputFormatter ?? formatter.default

                        res.status(context.status)
                        if (outputFormatter.mimeType) res.setHeader('Content-Type', outputFormatter.mimeType)
                        if (result) res.send(outputFormatter.format(result))
                    } catch (error) {
                        const { status, message } = errorHandler(error)

                        if (status >= 500) {
                            console.warn('Unhandled route error', { method: req.method, path: req.path, query: req.query, error: String(error) })
                        }

                        res.status(status).send({ message })
                    }
                }
            })
        },
    })
}
