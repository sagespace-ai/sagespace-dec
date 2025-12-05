"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, CheckCircle, FileText, Play, Lock } from "lucide-react"
import Link from "next/link"

export default function GovernancePage() {
  const { isEnterpriseUser } = useAuth()
  const [isRunningAudit, setIsRunningAudit] = useState(false)

  const handleRunAudit = async () => {
    setIsRunningAudit(true)
    // Stub API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRunningAudit(false)
  }

  // Feature gate for non-enterprise users
  if (!isEnterpriseUser()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">
                Enterprise Feature
              </h1>
              <p className="text-slate-400 text-lg mb-8">
                Governance and compliance features are available on the Enterprise plan. Get advanced audit trails,
                policy management, and compliance reporting.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/pricing">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Upgrade to Enterprise
                  </Button>
                </Link>
                <Link href="/multiverse">
                  <Button size="lg" variant="outline">
                    Back to Multiverse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">
              Governance & Compliance
            </h1>
            <p className="text-slate-400">
              Manage policies, run audits, and ensure your AI usage meets compliance requirements.
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Run Governance Audit</CardTitle>
                    <CardDescription>
                      Scan your universe for policy violations, PII exposure, and compliance issues.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleRunAudit}
                    disabled={isRunningAudit}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunningAudit ? "Running..." : "Run Audit"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <Shield className="w-8 h-8 text-green-400 mb-2" />
                  <CardTitle className="text-white text-lg">Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">12</div>
                  <p className="text-slate-400 text-sm">All systems compliant</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                  <CardTitle className="text-white text-lg">Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">3</div>
                  <p className="text-slate-400 text-sm">Requires review</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CheckCircle className="w-8 h-8 text-cyan-400 mb-2" />
                  <CardTitle className="text-white text-lg">Audit Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">94%</div>
                  <p className="text-slate-400 text-sm">Above target</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Audit Logs</CardTitle>
                <CardDescription>Compliance events and policy violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "success", message: "PII scan completed - No violations found", time: "2 hours ago" },
                    { type: "warning", message: "Age gating triggered for sensitive content", time: "5 hours ago" },
                    { type: "success", message: "Full governance audit completed", time: "1 day ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${log.type === "success" ? "bg-green-400" : "bg-yellow-400"}`}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{log.message}</p>
                        <p className="text-slate-400 text-xs mt-1">{log.time}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
