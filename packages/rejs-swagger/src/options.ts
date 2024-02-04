import { UrlSchema } from '@relab/rejs'

export type SwaggerOptions = {
    path?: UrlSchema
    version?: string
    title?: string
    description?: string
    ui?:
        | {
              enabled: true
              path?: UrlSchema
          }
        | { enabled: false }
}
