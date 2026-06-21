import type { LucideIcon } from 'lucide-react'

export type FieldType = 'text' | 'textarea' | 'select' | 'toggle'

export interface SelectOption {
  value: string
  label: string
}

export interface FieldSchema {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  options?: SelectOption[]
  required?: boolean
  defaultValue?: string
  rows?: number
  description?: string
}

export interface ToolDefinition {
  id: string
  title: string
  description: string
  Icon: LucideIcon
  fields: FieldSchema[]
}
