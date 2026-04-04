import TopBar from '@/components/layout/TopBar'
import PageContainer from '@/components/layout/PageContainer'
import TodayTasksList from '@/components/dashboard/TodayTasksList'
import ProjectMetricCard from '@/components/dashboard/ProjectMetricCard'
import Spinner from '@/components/ui/Spinner'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/stores/authStore'

const ENCOURAGEMENTS = [
  'Bora salvar vidas, doutora! 💚',
  'Cada tarefa concluída é uma paciente bem cuidada! 🩺',
  'Você consegue! A medicina te espera! ✨',
  'Plantão de estudos em andamento! 🏥',
  'Um passo de cada vez rumo ao diploma! 🎓',
  'A consistência é o melhor remédio! 💊',
  'Foco na anamnese dos estudos! 📋',
]

function getDailyEncouragement() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return ENCOURAGEMENTS[dayOfYear % ENCOURAGEMENTS.length]
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { todayCards, boardMetrics, loading } = useDashboard()

  const activeBoardMetrics = boardMetrics.filter((m) => m.totalCards > 0 || m.overdueCards > 0)

  return (
    <>
      <TopBar />
      <PageContainer>
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            Olá, {user?.name?.split(' ')[0] || 'Doutora'}! 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{getDailyEncouragement()}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Today's tasks */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                📅 Para hoje
              </h2>
              <TodayTasksList cards={todayCards} />
            </section>

            {/* Board metrics */}
            {activeBoardMetrics.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  📊 Seus projetos
                </h2>
                <div className="flex flex-col gap-3">
                  {activeBoardMetrics.map((metric) => (
                    <ProjectMetricCard key={metric.boardId} metric={metric} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {boardMetrics.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🩺</div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Pronto para começar?</h2>
                <p className="text-sm text-gray-400">
                  Crie seu primeiro projeto na aba <strong>Projetos</strong> e comece a organizar seus estudos!
                </p>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  )
}
