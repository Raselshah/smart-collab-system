'use client'

import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { format } from 'date-fns'
import {
    Activity,
    CheckSquare,
    Clock,
    Edit2,
    FolderPlus,
    Search,
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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [searchTerm, actionFilter, activities])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      const result = await response.json()
      if (result.success) {
        setActivities(result.data)
        setFilteredActivities(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      toast.error('Failed to load activity log')
    } finally {
      setLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    // Filter by action type
    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.action === actionFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.details.toLowerCase().includes(term) ||
        activity.user.name.toLowerCase().includes(term) ||
        activity.project?.name.toLowerCase().includes(term) ||
        activity.task?.title.toLowerCase().includes(term)
      )
    }

    setFilteredActivities(filtered)
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

  const getUniqueActions = () => {
    const actions = new Set(activities.map(a => a.action))
    return Array.from(actions)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track all system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:w-64"
        >
          <option value="all">All Actions</option>
          {getUniqueActions().map(action => (
            <option key={action} value={action}>
              {action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </Select>
      </div>

      {/* Activities List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredActivities.length} of {activities.length} activities
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No activities found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.user.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {activity.user.role.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">·</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.details}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      {activity.project && (
                        <span className="flex items-center gap-1">
                          <FolderPlus className="w-3 h-3" />
                          {activity.project.name}
                        </span>
                      )}
                      {activity.task && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          {activity.task.title}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(activity.createdAt), 'MMM dd, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}