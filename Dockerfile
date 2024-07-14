# Dependencies
FROM public.ecr.aws/docker/library/node:20.15.0-slim AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

# Rebuild source
FROM public.ecr.aws/docker/library/node:20.15.0-slim AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Run service
FROM public.ecr.aws/docker/library/node:20.15.0-slim AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 demogroup
RUN adduser --system --uid 1001 demouser

COPY --from=builder /app/package.json ./package.json

COPY --chown=demouser:demogroup env.local.yaml init_env.sh ./
COPY --chown=demouser:demogroup --from=builder /app/dist ./dist
COPY --chown=demouser:demogroup --from=builder /app/node_modules ./node_modules

USER demouser

EXPOSE 8800
ENV PORT 8800

# Start the application
CMD ["/bin/bash", "-c", ". init_env.sh && node dist/main"]
