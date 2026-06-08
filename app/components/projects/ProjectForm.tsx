'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Button } from '@/app/components/ui/Button'
import { toast } from 'sonner'

const projectFormSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']),
})

type ProjectFormData = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  project?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description || '',
      deadline: new Date(project.deadline).toISOString().split('T')[0],
      status: project.status,
    } : {
      status: 'ACTIVE',
    },
  })

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true)
    try {
      const url = project ? `/api/projects/${project.id}` : '/api/projects'
      const method = project ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      if (result.success) {
        toast.success(project ? 'Project updated successfully' : 'Project created successfully')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to save project')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Project Name"
        placeholder="Enter project name"
        {...register('name')}
        error={errors.name?.message}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter project description"
        />
      </div>
      
      <Input
        label="Deadline"
        type="date"
        {...register('deadline')}
        error={errors.deadline?.message}
      />
      
      <Select
        label="Status"
        {...register('status')}
        error={errors.status?.message}
      >
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="ON_HOLD">On Hold</option>
      </Select>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}