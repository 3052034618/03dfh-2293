import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  PieChart,
  Users,
  Wallet,
  FileSearch,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const navItems = [
  { path: '/overview', label: '总览大屏', icon: LayoutDashboard },
  { path: '/store-compare', label: '门店对比', icon: Store },
  { path: '/project-analysis', label: '项目分析', icon: PieChart },
  { path: '/personnel', label: '人员关联', icon: Users },
  { path: '/compensation', label: '赔付结构', icon: Wallet },
  { path: '/case-review', label: '案例抽检', icon: FileSearch },
]

const breadcrumbMap: Record<string, string> = {
  '/overview': '总览大屏',
  '/store-compare': '门店对比',
  '/project-analysis': '项目分析',
  '/personnel': '人员关联',
  '/compensation': '赔付结构',
  '/case-review': '案例抽检',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar, activeAlerts, showAlertPanel, toggleAlertPanel, setSelectedCaseId } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = breadcrumbMap[location.pathname] || '总览大屏'

  const goToCase = (caseId?: string) => {
    if (!caseId) return
    setSelectedCaseId(caseId)
    toggleAlertPanel()
    navigate('/case-review')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <aside
        className={`flex flex-col border-r border-dark-700/50 bg-dark-900 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-dark-700/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-ice flex items-center justify-center">
                <Wallet className="w-4 h-4 text-dark-900" />
              </div>
              <span className="text-sm font-semibold text-white tracking-wide">客诉赔付分析</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-dark-700/50 text-slate-light transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-ice/10 to-ice/5 text-ice border border-ice/20'
                    : 'text-slate-light hover:text-white hover:bg-dark-700/30'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-700/50">
          {!sidebarCollapsed && (
            <div className="glass-card rounded-xl p-3 space-y-2">
              <div className="text-xs text-slate-light">数据更新</div>
              <div className="text-xs text-white font-tabular">2025-12-10 09:30</div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate">医美连锁</span>
            <span className="text-dark-600">/</span>
            <span className="text-white font-medium">{currentPage}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleAlertPanel}
              className="relative p-2 rounded-lg hover:bg-dark-700/50 text-slate-light transition-colors"
            >
              <Bell className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                  {activeAlerts.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald to-ice flex items-center justify-center text-dark-900 text-xs font-bold">
                运
              </div>
              <span className="text-sm text-slate-light">运营总监</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">{children}</main>
      </div>

      {showAlertPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={toggleAlertPanel} />
          <div className="fixed right-0 top-0 bottom-0 w-96 z-50 bg-dark-900 border-l border-dark-700/50 shadow-2xl overflow-y-auto scrollbar-thin">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">预警通知</h3>
                <button onClick={toggleAlertPanel} className="text-slate hover:text-white transition-colors">
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-slate">暂无预警</div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`glass-card rounded-xl p-4 border-l-4 ${
                        alert.severity === 'critical'
                          ? 'border-l-coral'
                          : alert.severity === 'warning'
                          ? 'border-l-amber'
                          : 'border-l-ice'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            alert.severity === 'critical'
                              ? 'text-coral'
                              : alert.severity === 'warning'
                              ? 'text-amber'
                              : 'text-ice'
                          }`}
                        />
                      <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-relaxed">{alert.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate font-tabular">{alert.timestamp}</p>
                            {alert.caseId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  goToCase(alert.caseId)
                                }}
                                className="flex items-center gap-1 text-xs text-ice hover:text-ice-light transition-colors"
                              >
                                查看案例
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
