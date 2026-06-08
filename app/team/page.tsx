'use client'

import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Modal } from '@/app/components/ui/Modal'
import { Select } from '@/app/components/ui/Select'
import { format } from 'date-fns'
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    MoreVertical,
    Search,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  isOwner?: boolean
  createdAt: string
  workload: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    todoTasks: number
    overdueTasks: number
    completionRate: number
  }
  recentTasks: Array<{
    id: string
    title: string
    status: string
    dueDate: string
    project: { name: string }
  }>
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    fetchTeamMembers()
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [searchTerm, roleFilter, members])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()
      if (result.success) {
        setCurrentUserRole(result.user.role)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team/members')
      const result = await response.json()
      if (result.success) {
        setMembers(result.data)
        setFilteredMembers(result.data)
      }
    } catch (error) {
      toast.error('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = [...members]

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    setFilteredMembers(filtered)
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success('User role updated successfully')
        fetchTeamMembers()
        setIsRoleModalOpen(false)
        setSelectedMember(null)
      } else {
        toast.error(result.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'PROJECT_MANAGER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'TEAM_MEMBER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator'
      case 'PROJECT_MANAGER':
        return 'Project Manager'
      case 'TEAM_MEMBER':
        return 'Team Member'
      default:
        return role
    }
  }

  const getWorkloadColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600 dark:text-green-400'
    if (rate >= 50) return 'text-blue-600 dark:text-blue-400'
    if (rate >= 25) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your team and track their workload
          </p>
        </div>
        {(currentUserRole === 'ADMIN' || currentUserRole === 'PROJECT_MANAGER') && (
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-48"
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Administrators</option>
          <option value="PROJECT_MANAGER">Project Managers</option>
          <option value="TEAM_MEMBER">Team Members</option>
        </Select>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.name}
                      {member.isOwner && (
                        <span className="ml-2 text-xs text-yellow-600">(Owner)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                    <Badge className={`mt-1 ${getRoleBadgeColor(member.role)}`}>
                      {getRoleName(member.role)}
                    </Badge>
                  </div>
                </div>
                {(currentUserRole === 'ADMIN' && member.role !== 'ADMIN') && (
                  <button
                    onClick={() => {
                      setSelectedMember(member)
                      setNewRole(member.role)
                      setIsRoleModalOpen(true)
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Workload Stats */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className={`font-semibold ${getWorkloadColor(member.workload.completionRate)}`}>
                    {member.workload.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${member.workload.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Completed</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {member.workload.completedTasks}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">In Progress</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {member.workload.inProgressTasks}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Overdue</span>
                  </div>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                    {member.workload.overdueTasks}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Total</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {member.workload.totalTasks}
                  </p>
                </div>
              </div>

              {/* Recent Tasks */}
              {member.recentTasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Recent Tasks
                  </p>
                  <div className="space-y-2">
                    {member.recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-700 dark:text-gray-300">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.project.name}</p>
                        </div>
                        <Badge className={
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {task.status === 'IN_PROGRESS' ? 'In Progress' : 
                           task.status === 'COMPLETED' ? 'Completed' : 'To Do'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                Joined {format(new Date(member.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No members found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Update Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false)
          setSelectedMember(null)
        }}
        title="Update User Role"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User
              </label>
              <p className="text-gray-900 dark:text-white">{selectedMember.name}</p>
              <p className="text-sm text-gray-500">{selectedMember.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                {currentUserRole === 'ADMIN' && (
                  <option value="ADMIN">Administrator</option>
                )}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => updateUserRole(selectedMember.id, newRole)}>
                Update Role
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRoleModalOpen(false)
                  setSelectedMember(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}