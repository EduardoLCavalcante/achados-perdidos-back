# Lost & Found - Backend Express

API REST para o sistema de Achados e Perdidos.

## Instalação

```bash
cd backend
npm install
```

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

O servidor inicia em `http://localhost:4000`

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/items | Lista todos os itens (filtros: type, category, color, status, search) |
| GET | /api/items/:id | Busca item por ID |
| POST | /api/items | Cria novo item (suporta multipart/form-data para imagem) |
| PUT | /api/items/:id | Atualiza item |
| PATCH | /api/items/:id/status | Atualiza apenas o status |
| POST | /api/items/:id/claim | Reivindica um item encontrado |
| GET | /health | Health check |

## Exemplo de uso

```bash
# Listar itens encontrados
curl http://localhost:4000/api/items?type=found

# Criar item perdido
curl -X POST http://localhost:4000/api/items \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Mochila Azul","category":"Acessórios","location":"Bloco A","type":"lost"}'
```
