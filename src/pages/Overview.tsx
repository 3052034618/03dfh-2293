import { stores, months, monthlyReviews } from '@/data/mockData'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, FileText, Clock, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react'

const totalComplaints = stores.reduce((s, st) => s + st.complaintCount, 0)
const totalCompensation = stores.reduce((s, st) => s + st.totalCompensation, 0)
const avgHandleDays = +(stores.reduce((s, st) => s + st.avgHandleDays, 0) / stores.length).toFixed(2)
const closeRate = +(stores.reduce((s, st) => s + st.closedCount, 0) / totalComplaints * 100).toFixed(1)

const kpis = [
  { label: '总投诉量', value: totalComplaints, trend: +2.3, icon: FileText, color: 'text-ice' },
  { label: '结案率', value: `${closeRate}%`, trend: +1.2, icon: TrendingUp, color: 'text-emerald-400' },
  { label: '平均处理天数', value: avgHandleDays, trend: -0.5, icon: Clock, color: 'text-amber-400' },
  { label: '赔付总额', value: `¥${(totalCompensation / 10000).toFixed(1)}万`, trend: +5.8, icon: AlertCircle, color: 'text-coral' },
]

const chartData = months.map((m, i) => ({
  month: m,
  complaints: stores.reduce((s, st) => s + st.monthlyComplaints[i], 0),
  compensation: stores.reduce((s, st) => s + st.monthlyCompensation[i], 0),
}))

const sortedStores = [...stores].sort((a, b) => b.complaintCount - a.complaintCount)
const rankBadges = ['🥇', '🥈', '🥉']

const fmt = (n: number) => n.toLocaleString()

export default function Overview() {
  const navigate = useNavigate()
  const goStore = (storeId: string) => navigate(`/store/${storeId}`)
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white">数据总览</h1>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => {
          const up = k.trend > 0
          const positive = k.label === '平均处理天数' ? !up : up
          return (
            <div key={k.label} className="glass-card glass-card-hover rounded-xl p-5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{k.label}</span>
                <k.icon className="w-4 h-4 text-slate-500" />
              </div>
              <div className={`font-tabular text-3xl font-bold ${k.color}`}>{k.value}</div>
              <div className={`flex items-center gap-1 mt-2 text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{up ? '+' : ''}{k.trend}% 较上月</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass-card rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">投诉与赔付趋势</h2>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gComplaints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCompensation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8 }}
              labelStyle={{ color: '#E2E8F0' }}
              formatter={(v: number, name: string) => [name === 'complaints' ? `${v}件` : `¥${fmt(v)}`, name === 'complaints' ? '投诉量' : '赔付额']}
            />
            <Legend formatter={(v: string) => (v === 'complaints' ? '投诉量' : '赔付额')} />
            <Area yAxisId="left" type="monotone" dataKey="complaints" stroke="#10B981" fill="url(#gComplaints)" strokeWidth={2} />
            <Area yAxisId="right" type="monotone" dataKey="compensation" stroke="#F59E0B" fill="url(#gCompensation)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">门店排名</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50">
              <th className="text-left py-3 px-2">排名</th>
              <th className="text-left py-3 px-2">门店</th>
              <th className="text-left py-3 px-2">大区</th>
              <th className="text-right py-3 px-2">投诉量</th>
              <th className="text-right py-3 px-2">结案率</th>
              <th className="text-right py-3 px-2">平均处理天</th>
              <th className="text-right py-3 px-2">赔付总额</th>
            </tr>
          </thead>
          <tbody>
            {sortedStores.map((st, i) => (
              <tr key={st.id} className={`border-b border-slate-700/30 ${st.closeRate < 85 ? 'bg-red-500/10' : ''} cursor-pointer hover:bg-white/[0.03] transition-colors`}
                onClick={() => goStore(st.id)}>
                <td className="py-3 px-2">{i < 3 ? rankBadges[i] : i + 1}</td>
                <td className="py-3 px-2 text-white font-medium flex items-center gap-2">
                  {st.name}
                  <ExternalLink className="w-3.5 h-3.5 text-ice shrink-0" />
                </td>
                <td className="py-3 px-2 text-slate-400">{st.region}</td>
                <td className="py-3 px-2 text-right font-tabular text-white">{st.complaintCount}</td>
                <td className={`py-3 px-2 text-right font-tabular ${st.closeRate < 85 ? 'text-red-400 font-semibold' : 'text-emerald-400'}`}>
                  {st.closeRate}%
                </td>
                <td className="py-3 px-2 text-right font-tabular text-white">{st.avgHandleDays}</td>
                <td className="py-3 px-2 text-right font-tabular text-amber-400">¥{fmt(st.totalCompensation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">月度复盘摘要</h2>
        <div className="grid grid-cols-2 gap-4">
          {monthlyReviews.map((r) => (
            <div
              key={r.storeId}
              onClick={() => goStore(r.storeId)}
              className="glass-card glass-card-hover rounded-xl p-5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-ice" />
                <h3 className="text-white font-semibold">{r.storeName}</h3>
                <span className="text-xs text-slate-500 ml-auto">{r.month}</span>
                <ExternalLink className="w-3.5 h-3.5 text-ice" />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">{r.summary}</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-red-400 font-medium">问题：</span>
                  <span className="text-slate-300">{r.issues.join('；')}</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-medium">培训建议：</span>
                  <span className="text-slate-300">{r.trainingSuggestions.join('；')}</span>
                </div>
                <div>
                  <span className="text-amber-400 font-medium">项目调整：</span>
                  <span className="text-slate-300">{r.projectAdjustments.join('；')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
