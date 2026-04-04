import { useEffect } from 'react'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import { useUIStore } from '@/stores/uiStore'

const steps = [
  {
    intro: '👋 Bem-vinda ao seu <b>plantão de estudos</b>! Aqui é o seu QG. Fique de olho nos seus projetos em andamento e atrasados.',
    title: 'Gabizinha do SUS',
  },
  {
    element: '[data-intro-step="boards-link"]',
    intro: '📚 Crie projetos e guarde-os nas <b>gavetas dos seus semestres</b>. Seu "eu" do internato vai agradecer pelos resumos do ciclo básico!',
    title: 'Seus Projetos',
  },
  {
    element: '[data-intro-step="add-board"]',
    intro: '➕ Clique aqui para <b>criar seu primeiro projeto</b>. Pode ser um caso clínico, uma liga, um seminário...',
    title: 'Novo Projeto',
  },
  {
    element: '[data-intro-step="bottom-nav"]',
    intro: '🩺 Navegue pelo app por aqui. <b>Início</b> para o dashboard, <b>Projetos</b> para o Kanban, <b>Perfil</b> para suas configurações.',
    title: 'Navegação',
  },
]

export default function OnboardingTour() {
  const { onboardingPending, setOnboardingPending } = useUIStore()

  useEffect(() => {
    if (!onboardingPending) return

    const timeout = setTimeout(() => {
      const intro = introJs()

      intro.setOptions({
        steps,
        nextLabel: 'Próximo →',
        prevLabel: '← Anterior',
        doneLabel: 'Bora! 🚀',
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: false,
      })

      intro.oncomplete(() => setOnboardingPending(false))
      intro.onexit(() => setOnboardingPending(false))

      intro.start()
    }, 800)

    return () => clearTimeout(timeout)
  }, [onboardingPending])

  return null
}
