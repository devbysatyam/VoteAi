import '@testing-library/jest-dom';

// Mock scrollIntoView for JSDOM
const noop = () => {};
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', { value: noop });
Object.defineProperty(window.Element.prototype, 'scrollIntoView', { value: noop });
