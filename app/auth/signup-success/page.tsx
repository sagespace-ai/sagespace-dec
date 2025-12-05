import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesIcon } from "@/components/icons"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-black flex items-center justify-center p-4">
      {/* Animated stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <Card className="relative w-full max-w-md bg-slate-900/80 border-purple-500/20 backdrop-blur-sm z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SparklesIcon className="w-12 h-12 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-slate-400">We sent you a confirmation link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <p className="text-slate-300">
              Thank you for signing up! Please check your email inbox for a confirmation link to activate your account.
            </p>
            <p className="text-sm text-slate-400">
              Once confirmed, you'll be able to log in and start exploring the SageSpace universe.
            </p>
            <div className="pt-4">
              <a href="/auth/login" className="text-cyan-400 hover:text-cyan-300 underline">
                Return to login
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
