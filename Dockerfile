# Use a imagem oficial do Node.js como imagem base
FROM node:18

# Define o diretório de trabalho na imagem
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Log para indicar que o processo de instalação de dependências está começando
RUN echo "Instalando dependências..." && npm install && npm cache clean --force

# Copie o restante do código da aplicação
COPY . .

# Log para indicar que o processo de compilação está começando
RUN echo "Compilando TypeScript..." && npm run build

# Exponha a porta que a aplicação vai usar
EXPOSE 3000

# Log para indicar que a aplicação está prestes a iniciar
CMD echo "Iniciando a aplicação..." && npm start
