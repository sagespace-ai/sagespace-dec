import { Component, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper component that provides error boundary protection
 * with graceful fallback for critical app sections
 */
export class ErrorBoundaryWrapper extends Component<ErrorBoundaryWrapperProps> {
  render() {
    return (
      <ErrorBoundary fallback={this.props.fallback}>
        {this.props.children}
      </ErrorBoundary>
    )
  }
}
