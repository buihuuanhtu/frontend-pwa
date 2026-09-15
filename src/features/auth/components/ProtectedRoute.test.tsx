import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import { tokenService } from '@/services/tokenService'

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Private page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated visitors', () => {
    const { container } = renderRoute()
    expect(container).toHaveTextContent('Login page')
    expect(container).not.toHaveTextContent('Private page')
  })

  it('renders the private route when a token exists', () => {
    tokenService.setToken('test-token')
    const { container } = renderRoute()
    expect(container).toHaveTextContent('Private page')
  })
})
