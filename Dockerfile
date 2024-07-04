FROM public.ecr.aws/docker/library/node:20.15.0-slim AS BASEIMAGE

WORKDIR /src
COPY package*.json ./
RUN yarn
COPY . .
RUN yarn build

FROM node:20.15.0-alpine

WORKDIR /src
ENV TZ=UTC
COPY --from=BASEIMAGE /src/dist /src/dist
COPY --from=BASEIMAGE /src/node_modules /src/node_modules
EXPOSE 3000

CMD ["node", "dist/main.js"]