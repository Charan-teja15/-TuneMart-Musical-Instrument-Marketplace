"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { AlertTriangle, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

interface ReportRow {
  id: string
  target_type: string
  target_id: string
  reason: string
  description?: string
  status: "pending" | "investigating" | "resolved" | "dismissed"
  resolution_notes?: string
  created_at: string
  reporter?: {
    name?: string
    email?: string
  }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadReports = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin?entity=reports")
      const json = await res.json()
      if (json.success && json.reports) {
        setReports(json.reports)
      }
    } catch (e) {
      console.error("Failed to load reports:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleAction = async (action: "resolve_report" | "dismiss_report", id: string) => {
    setActionLoading(`${action}-${id}`)
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id })
      })
      if (res.ok) {
        await loadReports()
      }
    } catch (e) {
      console.error("Report action error:", e)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = reports.filter(r => {
    if (statusFilter === "all") return true
    return r.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F12]">Flagged Reports & Disputes</h1>
          <p className="text-sm text-[#78716C] mt-1">Investigate suspicious listings, abusive behavior, and dispute resolutions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReports} className="border-[#E7E5E4] text-xs h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Reports</option>
            <option value="pending">Pending Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
        </div>
      </div>

      <Card className="rounded-[20px] border border-[#E7E5E4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs font-semibold uppercase text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Reason & Description</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      Loading reports database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#78716C]">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      No incident reports found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 px-4 font-semibold capitalize text-[#0F0F12]">
                        {r.target_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#0F0F12]">{r.reason}</p>
                        {r.description && <p className="text-xs text-[#78716C] mt-0.5">{r.description}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E]">
                        {r.reporter?.name || r.reporter?.email || "Anonymous user"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          r.status === "resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          r.status === "dismissed" ? "bg-stone-50 text-stone-600 border border-stone-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.status === "pending" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              disabled={actionLoading !== null}
                              onClick={() => handleAction("resolve_report", r.id)}
                            >
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 border-[#E7E5E4] text-xs text-[#78716C]"
                              disabled={actionLoading !== null}
                              onClick={() => handleAction("dismiss_report", r.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#A8A29E]">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
