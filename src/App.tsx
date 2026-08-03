import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CampaignListPage from './pages/CampaignListPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CampaignCreatePage from './pages/CampaignCreatePage'
import ContributePage from './pages/ContributePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MyPage from './pages/MyPage'
import SignupPage from './pages/SignupPage'
import VendorConsolePage from './pages/VendorConsolePage'
import VendorsPage from './pages/VendorsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CampaignListPage />} />
        <Route path="/campaign/new" element={<CampaignCreatePage />} />
        <Route path="/campaign/:id" element={<CampaignDetailPage />} />
        <Route path="/campaign/:id/contribute" element={<ContributePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendor/console" element={<VendorConsolePage />} />
        <Route path="/me" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
