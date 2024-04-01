import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { defaultErrorHandler, jsonOutputFormatter, Middleware, normalizeUrlPath } from '@relab/rejs'
import express from 'express'
import swaggerUI from 'swagger-ui-dist'
import { z } from 'zod'

import { SwaggerOptions } from './options'
import { register } from './register'

extendZodWithOpenApi(z)

export const swagger: (options?: SwaggerOptions) => Middleware = options => configuration => {
    const swaggerPath = options?.path ?? '/swagger/swagger.json'

    const swaggerMiddleware: ReturnType<Middleware>[number] = (request, response, next) => {
        if (request.path === swaggerPath) {
            const registry = new OpenAPIRegistry()

            if (options?.configure) {
                options.configure(registry)
            }

            register(
                registry,
                configuration.prefix,
                configuration.errorHandler ?? defaultErrorHandler,
                {
                    default: configuration.defaultFormatter ?? jsonOutputFormatter,
                    formatters: configuration.formatters ?? {},
                },
                configuration.routes
            )

            const generator = new OpenApiGeneratorV3(registry.definitions)
            response
                .status(200)
                .send(
                    generator.generateDocument({
                        ...(options?.options ?? {}),
                        openapi: '3.0.0',
                        info: {
                            version: options?.version ?? '',
                            title: options?.title ?? '',
                            description: options?.description ?? '',
                        },
                    })
                )
                .end()
        } else {
            next()
        }
    }

    const middleware: ReturnType<Middleware> = [swaggerMiddleware]

    if (options?.ui?.enabled) {
        const uiUrlPath = options.ui.path ?? '/swagger'
        const initFilePath = normalizeUrlPath(`${uiUrlPath}/swagger-initializer.js`)?.toLowerCase() ?? './swagger-initializer.js'
        const initializerInterceptor: ReturnType<Middleware>[number] = (request, response, next) => {
            if (normalizeUrlPath(request.path)?.toLowerCase() !== initFilePath) {
                next()
                return
            }

            const result = `window.onload = function() { window.ui = SwaggerUIBundle({ url: "${swaggerPath}", dom_id: '#swagger-ui', deepLinking: true, presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset], plugins: [SwaggerUIBundle.plugins.DownloadUrl], layout: "StandaloneLayout" }); };`
            response.status(200).send(result).end()
        }

        middleware.push(initializerInterceptor)

        const swaggerUIPath: string = swaggerUI.absolutePath()
        const swaggerUIStatic: ReturnType<Middleware>[number] = express.static(swaggerUIPath)
        swaggerUIStatic.prefix = uiUrlPath

        middleware.push(swaggerUIStatic)
    }

    return middleware
}
