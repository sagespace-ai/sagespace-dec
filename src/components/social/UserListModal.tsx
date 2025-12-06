import { X, User } from 'lucide-react'
import { Card2035, Card2035Content, Card2035Header, Card2035Title } from '../ui/Card2035'
import { FadeIn } from '../motion/FadeIn'
import { FollowButton } from './FollowButton'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../LoadingSpinner'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UserListModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  users: User[]
  isLoading?: boolean
}

export function UserListModal({ isOpen, onClose, title, users, isLoading }: UserListModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card2035 className="w-full max-w-md max-h-[80vh] flex flex-col">
          <Card2035Header>
            <div className="flex items-center justify-between">
              <Card2035Title>{title}</Card2035Title>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </Card2035Header>
          <Card2035Content className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="md" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user, index) => (
                  <FadeIn key={user.id} delay={index * 0.05}>
                    <div
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => {
                        navigate(`/profile/${user.id}`)
                        onClose()
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <FollowButton userId={user.id} userName={user.name} size="sm" />
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </Card2035Content>
        </Card2035>
      </div>
    </>
  )
}
