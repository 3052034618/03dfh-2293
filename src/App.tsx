import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Overview from '@/pages/Overview'
import StoreCompare from '@/pages/StoreCompare'
import ProjectAnalysis from '@/pages/ProjectAnalysis'
import Personnel from '@/pages/Personnel'
import Compensation from '@/pages/Compensation'
import CaseReview from '@/pages/CaseReview'
import StoreMonthlyDetail from '@/pages/StoreMonthlyDetail'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/store-compare" element={<StoreCompare />} />
          <Route path="/store/:storeId" element={<StoreMonthlyDetail />} />
          <Route path="/project-analysis" element={<ProjectAnalysis />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/compensation" element={<Compensation />} />
          <Route path="/case-review" element={<CaseReview />} />
        </Routes>
      </Layout>
    </Router>
  )
}
