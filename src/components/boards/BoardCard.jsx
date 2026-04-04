import { Link } from 'react-router-dom'
import SemesterBadge from './SemesterBadge'

const boardEmojis = ['📚', '🩺', '💊', '🧬', '🔬', '🏥', '💉', '🫀', '🧠', '🦷', '👶', '🫁']

function getBoardEmoji(title) {
  const hash = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return boardEmojis[hash % boardEmojis.length]
}

export default function BoardCard({ board }) {
  const emoji = getBoardEmoji(board.title)

  return (
    <Link
      to={`/boards/${board.id}`}
      className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-mint-200 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{board.title}</h3>
          {board.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{board.description}</p>
          )}
          <div className="mt-2">
            <SemesterBadge semester={board.semester} />
          </div>
        </div>
      </div>
    </Link>
  )
}
