FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# กำหนดตัวแปรชี้เป้า URL ของ API ในเครือข่าย Docker
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api

EXPOSE 3000

CMD ["npm", "run", "dev"]