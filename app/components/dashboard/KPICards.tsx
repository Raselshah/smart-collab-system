'use client'

import { AlertCircle, CheckSquare, Clock, FolderKanban, TrendingUp } from 'lucide-react'

interface KPICardsProps {
  data: {
    totalProjects: number
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    overdueTasks: number
  }
}

export function KPICards({ data }: KPICardsProps) {
  const completionRate = data.totalTasks > 0 
    ? ((data.completedTasks / data.totalTasks) * 100).toFixed(1)
    : 0

  const cards = [
    {
      title: 'Total Projects',
      value: data.totalProjects,
      icon: FolderKanban,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Tasks',
      value: data.totalTasks,
      icon: CheckSquare,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Completed Tasks',
      value: data.completedTasks,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Pending Tasks',
      value: data.pendingTasks,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Overdue Tasks',
      value: data.overdueTasks,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
          {card.title === 'Completed Tasks' && data.totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Completion Rate</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}