import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { OpenAPIObjectConfig } from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator'
import { UrlSchema } from '@relab/rejs'

export type SwaggerOptions = {
    path?: UrlSchema
    version?: string
    title?: string
    description?: string
    configure?: (registry: OpenAPIRegistry) => void
    options?: Partial<OpenAPIObjectConfig>
    ui?:
        | {
              enabled: true
              path?: UrlSchema
          }
        | { enabled: false }
}
