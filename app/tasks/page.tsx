'use client'

import { TaskFilters } from '@/app/components/tasks/TaskFilters'
import { TaskForm } from '@/app/components/tasks/TaskForm'
import { TaskList } from '@/app/components/tasks/TaskList'
import { Button } from '@/app/components/ui/Button'
import { Modal } from '@/app/components/ui/Modal'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  projectId: string
  assignedTo: string | null
  dueDate: Date
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  project: {
    id: string
    name: string
  }
  assignedUser: {
    id: string
    name: string
    email: string
  } | null
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    overdue: false,
    upcoming: false,
  })

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo)
      if (filters.overdue) queryParams.append('overdue', 'true')
      if (filters.upcoming) queryParams.append('upcoming', 'true')

      const response = await fetch(`/api/tasks?${queryParams.toString()}`)
      const result = await response.json()
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Task status updated')
        fetchTasks()
      } else {
        toast.error(result.error || 'Failed to update task status')
      }
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all your tasks</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <TaskFilters filters={filters} onFilterChange={setFilters} />

      <TaskList
        tasks={tasks}
        loading={loading}
        onStatusChange={handleStatusChange}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSuccess={() => {
            setIsCreateModalOpen(false)
            fetchTasks()
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  )
}