import BoardCard from './BoardCard'

export default function BoardsGrid({ boards }) {
  if (!boards.length) return null

  // Group by semester
  const grouped = {}
  const noSemester = []
  boards.forEach((b) => {
    if (b.semester) {
      if (!grouped[b.semester]) grouped[b.semester] = []
      grouped[b.semester].push(b)
    } else {
      noSemester.push(b)
    }
  })

  const semesterKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  return (
    <div className="flex flex-col gap-6">
      {semesterKeys.map((sem) => (
        <section key={sem}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {sem}º Semestre
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grouped[sem].map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </section>
      ))}
      {noSemester.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Sem semestre
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {noSemester.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
