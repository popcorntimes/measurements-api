# Use a imagem oficial do Node.js
FROM node:18

# Crie o diretório de trabalho
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . .

# Instale o cliente PostgreSQL
RUN apt-get update && apt-get install -y postgresql-client

# Compile o código TypeScript
RUN npm run build

# Copie o script de entrada
COPY ./entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh           

# Exponha a porta que o aplicativo vai rodar
EXPOSE 3000

# Inicie o servidor da API
CMD ["sh", "/usr/src/app/entrypoint.sh"]
