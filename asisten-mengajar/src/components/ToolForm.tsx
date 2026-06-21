import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Wand2 } from 'lucide-react'
import type { ToolDefinition } from '../features/tools/types'
import { GlassCard } from './GlassCard'
import { Button } from './Button'
import { InputField } from './InputField'
import { SelectField } from './SelectField'
import { TextAreaField } from './TextAreaField'
import { Toggle } from './Toggle'

interface ToolFormProps {
  tool: ToolDefinition
  isLoading: boolean
  initialInputs?: Record<string, string>
  onSubmit: (inputs: Record<string, string>) => void
}

export interface ToolFormHandle {
  submit: () => void
}

function buildInitialState(tool: ToolDefinition, overrides?: Record<string, string>): Record<string, string> {
  const state: Record<string, string> = {}
  for (const field of tool.fields) {
    state[field.id] = overrides?.[field.id] ?? field.defaultValue ?? (field.type === 'toggle' ? 'false' : '')
  }
  return state
}

export const ToolForm = forwardRef<ToolFormHandle, ToolFormProps>(
  ({ tool, isLoading, initialInputs, onSubmit }, ref) => {
    const [values, setValues] = useState<Record<string, string>>(() =>
      buildInitialState(tool, initialInputs)
    )
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
      setValues(buildInitialState(tool, initialInputs))
      setErrors({})
    }, [tool, initialInputs])

    const setValue = (id: string, value: string) => {
      setValues((prev) => ({ ...prev, [id]: value }))
      if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }))
    }

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {}
      for (const field of tool.fields) {
        if (field.required && !values[field.id]?.trim()) {
          newErrors[field.id] = 'Kolom ini wajib diisi.'
        }
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!validate()) return
      onSubmit(values)
    }

    useImperativeHandle(ref, () => ({ submit: () => handleSubmit() }))

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <GlassCard goldBorder className="p-5">
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-1">
              <tool.Icon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <h2 className="font-display font-bold text-white text-lg">{tool.title}</h2>
            </div>
            <p className="text-sm text-emerald-300/60">{tool.description}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {tool.fields.map((field) => {
              if (field.type === 'select') {
                return (
                  <SelectField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={values[field.id] ?? ''}
                    onChange={(v) => setValue(field.id, v)}
                    options={field.options ?? []}
                    required={field.required}
                    error={errors[field.id]}
                  />
                )
              }
              if (field.type === 'textarea') {
                return (
                  <TextAreaField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={values[field.id] ?? ''}
                    onChange={(v) => setValue(field.id, v)}
                    placeholder={field.placeholder}
                    required={field.required}
                    error={errors[field.id]}
                    rows={field.rows}
                  />
                )
              }
              if (field.type === 'toggle') {
                return (
                  <Toggle
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    checked={values[field.id] === 'true'}
                    onChange={(v) => setValue(field.id, v ? 'true' : 'false')}
                    description={field.description}
                  />
                )
              }
              return (
                <InputField
                  key={field.id}
                  id={field.id}
                  label={field.label}
                  value={values[field.id] ?? ''}
                  onChange={(v) => setValue(field.id, v)}
                  placeholder={field.placeholder}
                  required={field.required}
                  error={errors[field.id]}
                />
              )
            })}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="mt-2 w-full"
            >
              <Wand2 className="w-4 h-4" />
              Buat Sekarang
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    )
  }
)

ToolForm.displayName = 'ToolForm'
