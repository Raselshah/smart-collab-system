'use client'

import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { format } from 'date-fns'
import { Calendar, Edit2, MoreVertical, Trash2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ProjectCardProps {
  project: any
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getDaysUntilDeadline = () => {
    const today = new Date()
    const deadline = new Date(project.deadline)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntil = getDaysUntilDeadline()
  const isOverdue = daysUntil < 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 card-hover">
      <div className="flex justify-between items-start mb-4">
        <h3 
          className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => router.push(`/projects/${project.id}`)}
        >
          {project.name}
        </h3>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={() => {
                  onEdit()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {project.description || 'No description'}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <Badge className={getStatusColor(project.status)}>
          {project.status.replace('_', ' ')}
        </Badge>
        {isOverdue ? (
          <Badge variant="destructive">Overdue</Badge>
        ) : daysUntil <= 7 && (
          <Badge variant="warning">Due in {daysUntil} days</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Due {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{project.members?.length || 0} members</span>
        </div>
      </div>

      {project.tasks && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tasks:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {project.tasks.filter((t: any) => t.status === 'COMPLETED').length} / {project.tasks.length} completed
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${project.tasks.length > 0 
                  ? (project.tasks.filter((t: any) => t.status === 'COMPLETED').length / project.tasks.length) * 100 
                  : 0}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}