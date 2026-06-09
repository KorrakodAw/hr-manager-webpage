FROM node:20-alpine

# ติดตั้งไลบรารีช่วยรันสำหรับสยบบั๊ก Prisma ในระบบ Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD npx prisma generate && npm run dev