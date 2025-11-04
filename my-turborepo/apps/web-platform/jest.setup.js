import '@testing-library/jest-dom'

// Mock scrollIntoView for testing
// eslint-disable-next-line no-undef
HTMLElement.prototype.scrollIntoView = jest.fn()
