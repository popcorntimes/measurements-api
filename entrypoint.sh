set -e

# Esperar pelo PostgreSQL
while ! pg_isready -h db -p 5432 -U postgres; do
    echo "Aguardando o banco de dados..."
    sleep 2
done

# Iniciar a API
npm run start