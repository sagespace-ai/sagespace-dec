import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesIcon } from "@/components/icons"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/80 border-red-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SparklesIcon className="w-12 h-12 text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-400">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          {params?.error ? (
            <p className="text-sm text-slate-300 text-center">Error: {params.error}</p>
          ) : (
            <p className="text-sm text-slate-300 text-center">An unspecified error occurred during authentication.</p>
          )}
          <div className="mt-6 text-center">
            <a href="/auth/login" className="text-cyan-400 hover:text-cyan-300 underline">
              Return to login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
