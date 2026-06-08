'use client'

import { Barcode, Calendar, CheckCircle, Clock, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts'

interface ChartsProps {
  data: {
    taskStatusDistribution: {
      todo: number
      inProgress: number
      completed: number
    }
    priorityBreakdown: {
      high: number
      medium: number
      low: number
    }
    projectProgress: Array<{
      name: string
      progress: number
    }>
  }
}

// Type definitions for tooltip props
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      name: string
      progress: number
      fullName?: string
    }
  }>
  label?: string
}

interface CustomPieTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    percent: number
  }>
}

export function Charts({ data }: ChartsProps) {
  // Prepare data for task status pie chart
  const taskStatusData = [
    { name: 'To Do', value: data.taskStatusDistribution.todo, color: '#94a3b8' },
    { name: 'In Progress', value: data.taskStatusDistribution.inProgress, color: '#3b82f6' },
    { name: 'Completed', value: data.taskStatusDistribution.completed, color: '#10b981' },
  ]

  // Prepare data for priority breakdown pie chart
  const priorityData = [
    { name: 'High', value: data.priorityBreakdown.high, color: '#ef4444' },
    { name: 'Medium', value: data.priorityBreakdown.medium, color: '#f59e0b' },
    { name: 'Low', value: data.priorityBreakdown.low, color: '#10b981' },
  ]

  // Prepare data for project progress bar chart
  const projectProgressData = data.projectProgress.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 12) + '...' : project.name,
    progress: project.progress,
    fullName: project.name,
  }))

  // Calculate completion rate
  const totalTasks = taskStatusData.reduce((sum, item) => sum + item.value, 0)
  const completionRate = totalTasks > 0 
    ? ((data.taskStatusDistribution.completed / totalTasks) * 100).toFixed(1)
    : 0

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {dataPoint.fullName || label}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {payload[0].value.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${payload[0].value}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Status:</span>
              <span className="font-medium">
                {payload[0].value === 100 ? '✅ Completed' : 
                 payload[0].value > 0 ? '🔄 In Progress' : 
                 '⏳ Not Started'}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for pie charts
  const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
    if (active && payload && payload.length) {
      const total = taskStatusData.reduce((sum, item) => sum + item.value, 0)
      const percentage = ((payload[0].value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].name}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {payload[0].value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Percentage:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for priority pie chart
  const CustomPriorityTooltip = ({ active, payload }: CustomPieTooltipProps) => {
    if (active && payload && payload.length) {
      const total = priorityData.reduce((sum, item) => sum + item.value, 0)
      const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0
      
      const getPriorityColor = (name: string) => {
        switch(name) {
          case 'High': return 'text-red-600 dark:text-red-400'
          case 'Medium': return 'text-yellow-600 dark:text-yellow-400'
          case 'Low': return 'text-green-600 dark:text-green-400'
          default: return 'text-gray-600'
        }
      }
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]">
          <p className={`font-semibold mb-2 ${getPriorityColor(payload[0].name)}`}>
            {payload[0].name} Priority
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tasks:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {payload[0].value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Percentage:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for area chart
  const CustomAreaTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            Project {label}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {payload[0].value.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${payload[0].value}%` }}
              />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Completion Rate Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">Overall Completion Rate</p>
            <p className="text-3xl font-bold mt-1">{completionRate}%</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-blue-100 text-xs mt-2">
          {data.taskStatusDistribution.completed} of {totalTasks} tasks completed
        </p>
      </div>

      {/* Two Column Layout for Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 chart-container">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Task Status Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">To Do</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.taskStatusDistribution.todo}
              </p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.taskStatusDistribution.inProgress}
              </p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.taskStatusDistribution.completed}
              </p>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 chart-container">
          <div className="flex items-center gap-2 mb-4">
            <Barcode  className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Priority Breakdown
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPriorityTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">High Priority</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {data.priorityBreakdown.high}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Medium Priority</p>
              <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {data.priorityBreakdown.medium}
              </p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">Low Priority</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {data.priorityBreakdown.low}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Progress Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 chart-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Progress Overview
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-4 h-4" />
            <span>Completion Percentage</span>
          </div>
        </div>
        
        {projectProgressData.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Create a project to see progress tracking
            </p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={projectProgressData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Legend />
                <Bar 
                  dataKey="progress" 
                  name="Completion Rate" 
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                >
                  {projectProgressData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.progress >= 75 ? '#10b981' : entry.progress >= 50 ? '#3b82f6' : entry.progress >= 25 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Progress Summary */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400">Completed Projects</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {projectProgressData.filter(p => p.progress === 100).length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {projectProgressData.filter(p => p.progress > 0 && p.progress < 100).length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Not Started</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {projectProgressData.filter(p => p.progress === 0).length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Timeline Chart for Project Trends */}
      {projectProgressData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 chart-container">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Progress Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={projectProgressData.map((project, index) => ({
                index: index + 1,
                progress: project.progress,
                name: project.name,
              }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="index" 
                label={{ value: 'Project Number', position: 'insideBottom', offset: -5 }}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomAreaTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="progress" 
                name="Project Progress"
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#colorProgress)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}