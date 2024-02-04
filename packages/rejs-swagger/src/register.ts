import { OpenAPIRegistry, ResponseConfig, ZodContentObject, ZodMediaTypeObject } from '@asteasolutions/zod-to-openapi'
import { ErrorHandler, isRoute, isRouter, Method, normalizeUrlPath, OutputFormatter, Route, Router } from '@relab/rejs'

export const register = (
    registry: OpenAPIRegistry,
    prefix: string | undefined,
    errorHandler: ErrorHandler,
    formatter: {
        default: OutputFormatter
        formatters: Record<string, OutputFormatter>
    },
    routes: (Route | Router)[]
) => {
    for (const item of routes) {
        if (isRoute(item)) {
            const { metadata } = item

            const { response: responseDescription, ...description } = metadata.metadata ?? {}

            const responses: Record<number, ResponseConfig> = {}
            const mimeTypes = Array.from(new Set([formatter.default.mimeType, ...Object.values(formatter.formatters).map(({ mimeType }) => mimeType)]))

            if (metadata.schema.result) {
                const resultMediaType: ZodMediaTypeObject = {
                    schema: metadata.schema.result,
                }

                responses[200] = {
                    description: responseDescription ?? '',
                    content: mimeTypes.reduce<ZodContentObject>(
                        (result, mime) => ({
                            ...result,
                            [mime]: resultMediaType,
                        }),
                        {}
                    ),
                }
            }

            registry.registerPath({
                ...description,
                method: metadata.method.toLowerCase() as Lowercase<Method>,
                path:
                    '/' +
                    [normalizeUrlPath(prefix), normalizeUrlPath(metadata.path)]
                        .filter((url): url is string => !!url)
                        .join('/')
                        .replace(/:(.+?)\//gi, (_, name) => `{${name}}/`)
                        .replace(/:(.+?)$/gi, (_, name) => `{${name}}`),
                request: {
                    params: metadata.schema.route,
                    // body: metadata.schema.body,
                    body: metadata.schema.body
                        ? {
                              content: mimeTypes.reduce<ZodContentObject>(
                                  (result, mime) => ({
                                      ...result,
                                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                      [mime]: { schema: metadata.schema.body! },
                                  }),
                                  {}
                              ),
                          }
                        : undefined,
                    query: metadata.schema.query,
                },

                responses,
            })
        } else if (isRouter(item)) {
            const path = [normalizeUrlPath(prefix), normalizeUrlPath(item.path)].filter((url): url is string => !!url).join('/')
            register(registry, path, errorHandler, formatter, item.routes)
        }
    }
}
