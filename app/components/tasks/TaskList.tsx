'use client'

import { Badge } from '@/app/components/ui/Badge'
import { format } from 'date-fns'
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Edit2,
    Flag,
    MoreVertical,
    Trash2,
    User
} from 'lucide-react'
import { useState } from 'react'

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

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => Promise<void>
}

export function TaskList({ tasks, loading, onStatusChange, onEdit, onDelete }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Flag className="w-4 h-4 text-red-500" />
      case 'MEDIUM':
        return <Flag className="w-4 h-4 text-yellow-500" />
      case 'LOW':
        return <Flag className="w-4 h-4 text-green-500" />
      default:
        return <Flag className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Circle className="w-5 h-5 text-gray-400" />
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const isOverdue = (dueDate: Date, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'COMPLETED'
  }

  const handleStatusChangeClick = async (taskId: string, newStatus: string) => {
    setUpdatingStatus(taskId)
    try {
      await onStatusChange(taskId, newStatus)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusOptions = (currentStatus: string) => {
    const options = [
      { value: 'TODO', label: 'To Do', icon: Circle, color: 'gray' },
      { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'blue' },
      { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'green' },
    ]
    return options.filter(opt => opt.value !== currentStatus)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No tasks found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new task
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks?.map((task) => {
        const overdue = isOverdue(task.dueDate, task.status)
        const isExpanded = expandedTask === task.id
        const isMenuOpen = menuOpen === task.id
        const isUpdating = updatingStatus === task.id

        return (
          <div
            key={task.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md ${
              task.status === 'COMPLETED'
                ? 'border-gray-200 dark:border-gray-700 opacity-75'
                : 'border-gray-200 dark:border-gray-700'
            } ${overdue ? 'border-l-4 border-l-red-500' : ''}`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Status Toggle Button */}
                <button
                  onClick={() => {
                    if (task.status === 'COMPLETED') {
                      handleStatusChangeClick(task.id, 'TODO')
                    } else if (task.status === 'IN_PROGRESS') {
                      handleStatusChangeClick(task.id, 'COMPLETED')
                    } else {
                      handleStatusChangeClick(task.id, 'IN_PROGRESS')
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  title={task.status === 'COMPLETED' ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    getStatusIcon(task.status)
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3
                        className={`font-medium text-gray-900 dark:text-white ${
                          task.status === 'COMPLETED' ? 'line-through text-gray-500 dark:text-gray-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      
                      {/* Task Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityIcon(task.priority)}
                          <span className="ml-1 text-xs">{task.priority}</span>
                        </Badge>
                        
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === 'TODO' ? 'To Do' : 
                           task.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                        </Badge>
                        
                        {overdue && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span className={overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                            Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        {task.assignedUser && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <User className="w-3 h-3" />
                            <span>{task.assignedUser.name}</span>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          📁 {task.project.name}
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {(onEdit || onDelete) && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(isMenuOpen ? null : task.id)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          disabled={isUpdating}
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                              {onEdit && (
                                <button
                                  onClick={() => {
                                    onEdit(task)
                                    setMenuOpen(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit Task
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this task?')) {
                                      onDelete(task.id)
                                    }
                                    setMenuOpen(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Task
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description (Collapsible) */}
                  {task.description && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Show description
                          </>
                        )}
                      </button>
                      {isExpanded && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {task.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick Status Change Buttons */}
                  {task.status !== 'COMPLETED' && !isUpdating && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getStatusOptions(task.status).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChangeClick(task.id, option.value)}
                          className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                        >
                          <option.icon className={`w-3 h-3 text-${option.color}-500`} />
                          Move to {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}