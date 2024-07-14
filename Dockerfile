FROM node:20-alpine

RUN apk update && apk upgrade && apk add curl bash

RUN curl -O https://download.microsoft.com/download/b/9/f/b9f3cce4-3925-46d4-9f46-da08869c6486/msodbcsql18_18.0.1.1-1_amd64.apk \
&& curl -O https://download.microsoft.com/download/b/9/f/b9f3cce4-3925-46d4-9f46-da08869c6486/mssql-tools18_18.0.1.1-1_amd64.apk

RUN apk add --allow-untrusted msodbcsql18_18.0.1.1-1_amd64.apk \
	&& apk add --allow-untrusted mssql-tools18_18.0.1.1-1_amd64.apk \
	&& rm -f msodbcsql18_18.0.1.1-1_amd64.apk mssql-tools18_18.0.1.1-1_amd64.apk

ADD . /app
WORKDIR /app

RUN npm rebuild bcrypt --build-from-source
RUN npm install -g pnpm && pnpm install && pnpm build


ENTRYPOINT [ "pnpm", "start:prod" ]