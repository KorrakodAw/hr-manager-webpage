FROM node:20-alpine

# ติดตั้งไลบรารีช่วยรันสำหรับระบบ Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

# 🚀 บรรทัดพระเอกสยบบั๊ก Permission Denied:
# 1. บังคับยัดสิทธิ์ผ่อนปรน (chmod +x) ให้ไฟล์ทูลส์ทั้งหมดรันได้แบบ Executable 
# 2. เรียก npx prisma generate โดยตรงผ่านเชลล์ของตู้คอนเทนเนอร์
CMD ["sh", "-c", "chmod -R +x ./node_modules/.bin && npx prisma generate && npm run dev"]