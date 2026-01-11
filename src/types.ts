export type ItemType = "lost" | "found"
export type ItemStatus = "registered" | "analyzing" | "returned"

export interface Item {
  id: string
  name: string
  description: string
  category: string
  color: string
  location: string
  date: string
  image: string
  type: ItemType
  status: ItemStatus
  contactName?: string
  contactEmail?: string
  createdAt: string
}

export interface CreateItemDTO {
  name: string
  description: string
  category: string
  color: string
  location: string
  date: string
  image?: string
  type: ItemType
  contactName?: string
  contactEmail?: string
}
