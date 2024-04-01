import { OpenAPIObjectConfig } from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator'
import { UrlSchema } from '@relab/rejs'

export type SwaggerOptions = {
    path?: UrlSchema
    version?: string
    title?: string
    description?: string
    options?: OpenAPIObjectConfig
    ui?:
        | {
              enabled: true
              path?: UrlSchema
          }
        | { enabled: false }
}
