import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button2035 } from '../ui/Button2035'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
}

export function BackButton({ to, label = 'Back', className }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <Button2035
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={className}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">{label}</span>
    </Button2035>
  )
}
