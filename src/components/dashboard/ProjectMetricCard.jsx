import { Link } from 'react-router-dom'

function ProgressRing({ pct, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="#dcfce7" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
        stroke="#22c55e" fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

export default function ProjectMetricCard({ metric }) {
  const { boardId, title, totalCards, doneCards, overdueCards } = metric
  const pct = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0
  const inProgress = totalCards - doneCards - overdueCards

  return (
    <Link
      to={`/boards/${boardId}`}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-mint-200 transition-all flex items-center gap-4"
    >
      <div className="relative flex-shrink-0">
        <ProgressRing pct={pct} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-mint-600">
          {pct}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {doneCards > 0 && (
            <span className="text-xs bg-mint-100 text-mint-700 px-2 py-0.5 rounded-full">{doneCards} feito{doneCards > 1 ? 's' : ''}</span>
          )}
          {inProgress > 0 && (
            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{inProgress} em andamento</span>
          )}
          {overdueCards > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{overdueCards} atrasado{overdueCards > 1 ? 's' : ''}</span>
          )}
          {totalCards === 0 && (
            <span className="text-xs text-gray-400">Sem tarefas ainda</span>
          )}
        </div>
      </div>
    </Link>
  )
}
