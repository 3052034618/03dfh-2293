import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { stores, projects } from '@/data/mockData'
import { ExternalLink } from 'lucide-react'

const REGIONS = ['全部', '华北', '华东', '华南', '西南', '华中']
const PROJECT_CATEGORIES = ['全部', ...new Set(projects.map(p => p.category))]
const STORE_COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#EF4444', '#A78BFA', '#F472B6']

type SortKey = 'name' | 'region' | 'complaintCount' | 'closeRate' | 'avgHandleDays' | 'totalCompensation'

const closeRateColor = (rate: number) => {
  if (rate > 90) return 'text-emerald'
  if (rate >= 85) return 'text-amber'
  return 'text-coral'
}

export default function StoreCompare() {
  const navigate = useNavigate()
  const goStore = (id: string) => navigate(`/store/${id}`)
  const [region, setRegion] = useState('全部')
  const [projectCategory, setProjectCategory] = useState('全部')
  const [sortKey, setSortKey] = useState<SortKey>('complaintCount')
  const [sortAsc, setSortAsc] = useState(false)

  const filteredStores = useMemo(() => {
    let list = [...stores]
    if (region !== '全部') list = list.filter(s => s.region === region)
    if (projectCategory !== '全部') {
      const projectIds = projects.filter(p => p.category === projectCategory).map(p => p.id)
      if (projectIds.length > 0) list = list.filter(() => true)
    }
    list.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
    return list
  }, [region, projectCategory, sortKey, sortAsc])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(prev => !prev)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 text-xs text-slate-light">
      {sortKey === col ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  )

  const radarData = useMemo(() => {
    const maxComp = Math.max(...stores.map(s => s.complaintCount))
    const maxDays = Math.max(...stores.map(s => s.avgHandleDays))
    const maxCompAmt = Math.max(...stores.map(s => s.totalCompensation))
    const dimensions = ['closeRate', 'handleSpeed', 'compControl', 'complaintVol', 'serviceQuality'] as const
    const labels: Record<string, string> = {
      closeRate: '结案率',
      handleSpeed: '处理速度',
      compControl: '赔付控制',
      complaintVol: '投诉量(反)',
      serviceQuality: '服务品质',
    }
    return dimensions.map(dim => {
      const entry: Record<string, string | number> = { dimension: labels[dim] }
      stores.forEach(s => {
        let val = 0
        if (dim === 'closeRate') val = s.closeRate
        if (dim === 'handleSpeed') val = Math.round(((maxDays - s.avgHandleDays) / maxDays) * 100)
        if (dim === 'compControl') val = Math.round(((maxCompAmt - s.totalCompensation) / maxCompAmt) * 100)
        if (dim === 'complaintVol') val = Math.round(((maxComp - s.complaintCount) / maxComp) * 100)
        if (dim === 'serviceQuality') val = Math.round((s.closeRate * 0.4 + (maxDays - s.avgHandleDays) / maxDays * 100 * 0.3 + (maxCompAmt - s.totalCompensation) / maxCompAmt * 100 * 0.3))
        entry[s.name] = val
      })
      return entry
    })
  }, [])

  const barData = useMemo(() =>
    stores.map(s => ({ name: s.name, complaintCount: s.complaintCount, closedCount: s.closedCount })),
    []
  )

  const fmt = (n: number) => n.toLocaleString('zh-CN')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">门店对比</h1>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="bg-dark-800 border border-dark-700 text-sm text-slate-light rounded-lg px-3 py-1.5 focus:outline-none focus:border-ice"
        >
          {REGIONS.map(r => <option key={r} value={r}>{r === '全部' ? '全部区域' : r}</option>)}
        </select>
        <select
          value={projectCategory}
          onChange={e => setProjectCategory(e.target.value)}
          className="bg-dark-800 border border-dark-700 text-sm text-slate-light rounded-lg px-3 py-1.5 focus:outline-none focus:border-ice"
        >
          {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c === '全部' ? '全部品类' : c}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-slate-light">
                {([
                  ['name', '门店名称'],
                  ['region', '区域'],
                  ['complaintCount', '投诉数'],
                  ['closeRate', '结案率'],
                  ['avgHandleDays', '平均处理天数'],
                  ['totalCompensation', '累计赔付'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  >
                    {label}<SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}
                  onClick={() => goStore(s.id)}
                  className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                    {s.name}
                    <ExternalLink className="w-3.5 h-3.5 text-ice shrink-0" />
                  </td>
                  <td className="px-4 py-3 text-slate-light">{s.region}</td>
                  <td className="px-4 py-3 font-tabular">{s.complaintCount}</td>
                  <td className={`px-4 py-3 font-tabular ${closeRateColor(s.closeRate)}`}>{s.closeRate}%</td>
                  <td className="px-4 py-3 font-tabular">{s.avgHandleDays}天</td>
                  <td className="px-4 py-3 font-tabular">¥{fmt(s.totalCompensation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">门店综合雷达图</h2>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(100,116,139,0.2)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
              {stores.map((s, i) => (
                <Radar key={s.id} name={s.name} dataKey={s.name} stroke={STORE_COLORS[i]} fill={STORE_COLORS[i]} fillOpacity={0.08} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8, fontSize: 12, color: '#E2E8F0' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-light mb-4">投诉量对比</h2>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8, fontSize: 12, color: '#E2E8F0' }}
              />
              <Bar dataKey="complaintCount" name="投诉总数" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="closedCount" name="已结案" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
