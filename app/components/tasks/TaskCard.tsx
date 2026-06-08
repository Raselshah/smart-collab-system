'use client'

import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { format } from 'date-fns'
import { Calendar, Flag, User } from 'lucide-react'

interface TaskCardProps {
  task: any
  onStatusChange: (taskId: string, newStatus: string) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'COMPLETED'}
          onCheckedChange={(checked) => {
            if (checked) {
              onStatusChange(task.id, 'COMPLETED')
            } else {
              onStatusChange(task.id, 'TODO')
            }
          }}
          disabled={task.status === 'COMPLETED'}
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className={`font-medium text-gray-900 dark:text-white ${
              task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''
            }`}>
              {task.title}
            </h3>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className={isOverdue ? 'text-red-600' : ''}>
                Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
            
            {task.assignedUser && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{task.assignedUser.name}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <span className="text-xs">Project:</span>
              <span className="font-medium">{task.project.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}