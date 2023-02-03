npm init -y
npm i typescript -D

npx tsc --init

npm i fastify
npm i @fastify/cors
npm i tsx -D

"dev": "tsx watch src/server.ts"

npm i prisma -D
npm i @prisma/client

npx prisma init --datasource-provider SQLite

npm i prisma-erd-generator @mermaid-js/mermaid-cli -D

npm i short-unique-id

npm i @fastify/jwt

COMANDOS DO PRISMA

"prisma": {
"seed": "tsx prisma/seed.ts"
},

npx prisma migrate dev
npx prisma studio
npx prisma db seed

npx prisma generate (para rodar a tabela de entidades)

1:00:51
