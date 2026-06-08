'use client'

import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { formatDistanceToNow } from 'date-fns'
import {
    Activity,
    CheckSquare,
    Clock,
    Edit2,
    FolderPlus,
    RefreshCw,
    Trash2,
    User,
    UserPlus
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Activity {
  id: string
  action: string
  details: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  project?: {
    id: string
    name: string
  }
  task?: {
    id: string
    title: string
  }
}

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      const result = await response.json()
      if (result.success) {
        setActivities(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      toast.error('Failed to load activity log')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchActivities()
    toast.success('Activity log refreshed')
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'PROJECT_CREATED':
        return <FolderPlus className="w-5 h-5 text-green-500" />
      case 'PROJECT_UPDATED':
        return <Edit2 className="w-5 h-5 text-blue-500" />
      case 'PROJECT_DELETED':
        return <Trash2 className="w-5 h-5 text-red-500" />
      case 'TASK_CREATED':
        return <CheckSquare className="w-5 h-5 text-purple-500" />
      case 'TASK_UPDATED':
        return <Edit2 className="w-5 h-5 text-yellow-500" />
      case 'TASK_ASSIGNED':
        return <UserPlus className="w-5 h-5 text-indigo-500" />
      case 'TASK_COMPLETED':
        return <CheckSquare className="w-5 h-5 text-green-500" />
      case 'MEMBER_ADDED':
        return <UserPlus className="w-5 h-5 text-cyan-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'PROJECT_CREATED':
        return 'border-l-green-500'
      case 'PROJECT_UPDATED':
        return 'border-l-blue-500'
      case 'PROJECT_DELETED':
        return 'border-l-red-500'
      case 'TASK_CREATED':
        return 'border-l-purple-500'
      case 'TASK_UPDATED':
        return 'border-l-yellow-500'
      case 'TASK_ASSIGNED':
        return 'border-l-indigo-500'
      case 'TASK_COMPLETED':
        return 'border-l-green-500'
      case 'MEMBER_ADDED':
        return 'border-l-cyan-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatActionText = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {activities.length} events
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No activities yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Activities will appear here when you start working
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 border-l-4 ${getActivityColor(activity.action)}`}
            >
              <div className="flex gap-3">
                {/* Avatar/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {activity.user.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatActionText(activity.action)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.details}
                  </p>
                  
                  {/* Links to related items */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    {activity.project && (
                      <span className="flex items-center gap-1">
                        <FolderPlus className="w-3 h-3" />
                        Project: {activity.project.name}
                      </span>
                    )}
                    {activity.task && (
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        Task: {activity.task.title}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Action Icon */}
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.action)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}