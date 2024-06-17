⚠️ Deprecated in favour of [fastify-kit](https://github.com/relab-services/dev-kit/tree/master/packages/fastify/fastify-kit).

⚠️ Do not use it in produciton.

# re.js

**re.js** is a framework built on top of Express that facilitates the development of API endpoints using the capabilities of Typescript and Zod.

## Features
- 💥 Tiny and lightweight
- 🏆 First class support of Zod and Typescript
- 🧠 Fully-typed routes, params and output
- 🤓 Out of the box OpenAPI/Swagger support
- 😎 Backward compatible with Express

## Getting started

``bash
npm install @relab/rejs --save
``

## Route

```typescript
import { route } from '@relab/rejs'
import { z } from 'zod'

export const helloWorld = route({
    method: 'POST',
    path: '/hello/:name',
    schema: {
        route: z.object({
            name: z.coerce.string(),
        }),
        result: z.string(),
    },
})(({ route }, context) => {
    return `${route.name}, hello world!`
})
```

## Setup routes serving

In your `index.ts`:

```typescript
import { serve } from '@relab/rejs'

import { helloWorld } from './hello-world'

void serve(
    {
        port: Number(process.env.PORT) || 3000,
        routes: [
            helloWorld,
        ],
    },
    port => {
        logger.info(`Listening http://localhost:${port}`)
    }
)
```

## Setup swagger

```bash
npm install @relab/rejs-swagger --save
```

In your `index.ts`:

```typescript
import { serve } from '@relab/rejs'
import { swagger } from '@relab/rejs-swagger'

import { helloWorld } from './hello-world'

void serve(
    {
        port: Number(process.env.PORT) || 3000,
        middlewares: [
            swagger({
                ui: {
                    enabled: true,
                },
            }),
        ],
        routes: [
            helloWorld,
        ],
    },
    port => {
        logger.info(`Listening http://localhost:${port}`)
    }
)
```

Now you can access Swagger by `/swagger` and `/swagger/swagger.json` URLs.

## License

Released under [MIT](/LICENSE) by [Sergey Zwezdin](https://github.com/sergeyzwezdin).
