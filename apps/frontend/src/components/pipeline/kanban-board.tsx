'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

interface Stage { id: string; name: string; color: string; order: number }
interface Candidate { id: string; name: string; email: string }
interface Application { id: string; candidate: Candidate; currentStageId: string | null; status: string }

interface Props {
  stages: Stage[]
  applications: Application[]
  onMove: (appId: string, stageId: string) => void
}

export function KanbanBoard({ stages, applications, onMove }: Props) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)

  function getAppsForStage(stageId: string) {
    return applications.filter(a => a.currentStageId === stageId && a.status === 'ACTIVE')
  }

  function handleDrop(stageId: string) {
    if (dragging && dragging !== stageId) {
      onMove(dragging, stageId)
    }
    setDragging(null)
    setOver(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {stages.sort((a, b) => a.order - b.order).map(stage => {
        const apps = getAppsForStage(stage.id)
        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-64"
            onDragOver={e => { e.preventDefault(); setOver(stage.id) }}
            onDrop={() => handleDrop(stage.id)}
            onDragLeave={() => setOver(null)}
          >
            <div className={`rounded-xl border-2 transition-colors min-h-32 ${
              over === stage.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  </div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                    {apps.length}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-2">
                {apps.map(app => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={() => setDragging(app.id)}
                    onDragEnd={() => { setDragging(null); setOver(null) }}
                    className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${
                      dragging === app.id ? 'opacity-50 rotate-1' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{app.candidate.name}</p>
                        <p className="text-xs text-gray-400 truncate">{app.candidate.email}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {apps.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-400">Nenhum candidato</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
