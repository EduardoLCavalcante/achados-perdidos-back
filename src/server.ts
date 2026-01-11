import express, { type Request, type Response } from "express"
import cors from "cors"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import type { Item, CreateItemDTO, ItemStatus } from "./types"

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Mock database - dados em memória
const items: Item[] = [
  {
    id: "1",
    name: "Chaves com Chaveiro Colorido",
    description: "Molho de chaves com chaveiro colorido",
    category: "Acessórios",
    color: "prata",
    location: "Bloco A, Biblioteca",
    date: "2023-10-20",
    image: "/keys-with-colorful-keychain.jpg",
    type: "found",
    status: "registered",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Garrafa de Água Inox",
    description: "Garrafa térmica de aço inoxidável",
    category: "Utensílios",
    color: "prata",
    location: "Bloco B, Cantina",
    date: "2023-10-19",
    image: "/stainless-steel-bottle.png",
    type: "found",
    status: "analyzing",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Guarda-chuva Preto",
    description: "Guarda-chuva dobrável preto",
    category: "Acessórios",
    color: "preto",
    location: "Bloco C, Auditório",
    date: "2023-10-18",
    image: "public/black-folding-umbrella.jpg",
    type: "found",
    status: "registered",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Caderno de Couro",
    description: "Caderno com capa de couro marrom",
    category: "Material Escolar",
    color: "marrom",
    location: "Bloco A, Sala 101",
    date: "2023-10-17",
    image: "/leather-notebook.jpg",
    type: "found",
    status: "returned",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Carteira de Couro Preta",
    description: "Carteira masculina de couro preto com documentos",
    category: "Acessórios",
    color: "preto",
    location: "Bloco C, Próximo a Cantina",
    date: "2023-10-15",
    image: "/black-leather-wallet.jpg",
    type: "found",
    status: "analyzing",
    contactName: "João Silva",
    contactEmail: "joao@email.com",
    createdAt: new Date().toISOString(),
  },
]

// ============ ROTAS ============

// GET /api/items - Listar todos os itens (com filtros opcionais)
app.get("/api/items", (req: Request, res: Response) => {
  const { type, category, color, status, search } = req.query

  let filteredItems = [...items]

  if (type) {
    filteredItems = filteredItems.filter((item) => item.type === type)
  }

  if (category) {
    filteredItems = filteredItems.filter((item) =>
      item.category.toLowerCase().includes((category as string).toLowerCase()),
    )
  }

  if (color) {
    filteredItems = filteredItems.filter((item) => item.color.toLowerCase().includes((color as string).toLowerCase()))
  }

  if (status) {
    filteredItems = filteredItems.filter((item) => item.status === status)
  }

  if (search) {
    const searchTerm = (search as string).toLowerCase()
    filteredItems = filteredItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm),
    )
  }

  res.json({
    success: true,
    data: filteredItems,
    total: filteredItems.length,
  })
})

// GET /api/items/:id - Buscar item por ID
app.get("/api/items/:id", (req: Request, res: Response) => {
  const { id } = req.params
  const item = items.find((i) => i.id === id)

  if (!item) {
    return res.status(404).json({
      success: false,
      error: "Item não encontrado",
    })
  }

  res.json({
    success: true,
    data: item,
  })
})

// POST /api/items - Criar novo item
app.post("/api/items", upload.single("image"), (req: Request, res: Response) => {
  const body = req.body as CreateItemDTO

  // Validação básica
  if (!body.name || !body.category || !body.location) {
    return res.status(400).json({
      success: false,
      error: "Campos obrigatórios: name, category, location",
    })
  }

  // Se houver imagem, converter para base64
  let imageData = body.image || "/placeholder.svg?height=200&width=200"
  if (req.file) {
    const base64 = req.file.buffer.toString("base64")
    const mimeType = req.file.mimetype
    imageData = `data:${mimeType};base64,${base64}`
  }

  const newItem: Item = {
    id: uuidv4(),
    name: body.name,
    description: body.description || "",
    category: body.category,
    color: body.color || "",
    location: body.location,
    date: body.date || new Date().toISOString().split("T")[0],
    image: imageData,
    type: body.type || "lost",
    status: "registered",
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    createdAt: new Date().toISOString(),
  }

  items.push(newItem)

  res.status(201).json({
    success: true,
    data: newItem,
    message: "Item criado com sucesso",
  })
})

// PUT /api/items/:id - Atualizar item
app.put("/api/items/:id", (req: Request, res: Response) => {
  const { id } = req.params
  const updates = req.body

  const itemIndex = items.findIndex((i) => i.id === id)

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Item não encontrado",
    })
  }

  items[itemIndex] = { ...items[itemIndex], ...updates }

  res.json({
    success: true,
    data: items[itemIndex],
    message: "Item atualizado com sucesso",
  })
})

// PATCH /api/items/:id/status - Atualizar status do item
app.patch("/api/items/:id/status", (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body as { status: ItemStatus }

  const validStatuses: ItemStatus[] = ["registered", "analyzing", "returned"]
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status inválido. Use: registered, analyzing, returned",
    })
  }

  const itemIndex = items.findIndex((i) => i.id === id)

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Item não encontrado",
    })
  }

  items[itemIndex].status = status

  res.json({
    success: true,
    data: items[itemIndex],
    message: `Status atualizado para: ${status}`,
  })
})

// DELETE /api/items/:id - Remover item
app.delete("/api/items/:id", (req: Request, res: Response) => {
  const { id } = req.params
  const itemIndex = items.findIndex((i) => i.id === id)

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Item não encontrado",
    })
  }

  const deletedItem = items.splice(itemIndex, 1)[0]

  res.json({
    success: true,
    data: deletedItem,
    message: "Item removido com sucesso",
  })
})

// POST /api/items/:id/claim - Reivindicar item
app.post("/api/items/:id/claim", (req: Request, res: Response) => {
  const { id } = req.params
  const { contactName, contactEmail } = req.body

  if (!contactName || !contactEmail) {
    return res.status(400).json({
      success: false,
      error: "Campos obrigatórios: contactName, contactEmail",
    })
  }

  const itemIndex = items.findIndex((i) => i.id === id)

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Item não encontrado",
    })
  }

  items[itemIndex].status = "analyzing"
  items[itemIndex].contactName = contactName
  items[itemIndex].contactEmail = contactEmail

  res.json({
    success: true,
    data: items[itemIndex],
    message: "Reivindicação registrada! Entraremos em contato.",
  })
})

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express rodando em http://localhost:${PORT}`)
  console.log(`📦 ${items.length} itens carregados na memória`)
})
