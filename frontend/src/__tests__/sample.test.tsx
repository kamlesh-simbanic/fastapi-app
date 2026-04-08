import { render, screen } from '@testing-library/react'

describe('Sample Test', () => {
    it('should pass', () => {
        expect(true).toBe(true)
    })

    it('renders a heading', () => {
        render(<h1>Hello Jest</h1>)
        const heading = screen.getByText(/hello jest/i)
        expect(heading).toBeInTheDocument()
    })
})
