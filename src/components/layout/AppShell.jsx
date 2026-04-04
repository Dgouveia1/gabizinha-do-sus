import BottomNav from './BottomNav'
import Toast from '@/components/ui/Toast'
import OnboardingTour from '@/components/onboarding/OnboardingTour'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      <BottomNav />
      <Toast />
      <OnboardingTour />
    </div>
  )
}
