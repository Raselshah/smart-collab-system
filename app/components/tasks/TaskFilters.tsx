'use client'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Filter, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TaskFiltersProps {
  filters: any
  onFilterChange: (filters: any) => void
}

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const [users, setUsers] = useState<any[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      status: '',
      priority: '',
      assignedTo: '',
      overdue: false,
      upcoming: false,
    })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false)

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {Object.values(filters).filter(v => v !== '' && v !== false).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear all
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </Select>

          <Select
            label="Priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>

          <Select
            label="Assigned To"
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </Select>

          <div className="flex gap-2 items-end">
            <Button
              variant={filters.overdue ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ ...filters, overdue: !filters.overdue, upcoming: false })}
            >
              Overdue
            </Button>
            <Button
              variant={filters.upcoming ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ ...filters, upcoming: !filters.upcoming, overdue: false })}
            >
              Upcoming (7 days)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}