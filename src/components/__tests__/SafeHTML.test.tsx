/**
 * SafeHTML Component Tests
 */

import { render } from '@testing-library/react';
import SafeHTML from '../SafeHTML';

describe('SafeHTML Component', () => {
  test('should render safe HTML', () => {
    const html = '<p>Hello World</p>';
    const { container } = render(<SafeHTML html={html} />);
    
    expect(container.querySelector('p')).toBeInTheDocument();
    expect(container.textContent).toContain('Hello World');
  });

  test('should sanitize dangerous HTML', () => {
    const html = '<script>alert("xss")</script><p>Safe content</p>';
    const { container } = render(<SafeHTML html={html} />);
    
    // Script should be removed
    expect(container.querySelector('script')).not.toBeInTheDocument();
    // Safe content should remain
    expect(container.querySelector('p')).toBeInTheDocument();
  });

  test('should allow safe tags', () => {
    const html = '<h1>Title</h1><p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
    const { container } = render(<SafeHTML html={html} />);
    
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();
    expect(container.querySelector('strong')).toBeInTheDocument();
    expect(container.querySelector('em')).toBeInTheDocument();
  });

  test('should allow links with href', () => {
    const html = '<a href="https://example.com">Link</a>';
    const { container } = render(<SafeHTML html={html} />);
    
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('should allow images with src and alt', () => {
    const html = '<img src="https://example.com/image.jpg" alt="Test image" />';
    const { container } = render(<SafeHTML html={html} />);
    
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  test('should return null for empty HTML', () => {
    const { container } = render(<SafeHTML html="" />);
    
    expect(container.firstChild).toBeNull();
  });

  test('should apply custom className', () => {
    const html = '<p>Test</p>';
    const { container } = render(<SafeHTML html={html} className="custom-class" />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  test('should have prose styling', () => {
    const html = '<p>Test</p>';
    const { container } = render(<SafeHTML html={html} />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('prose');
  });

  test('should sanitize onclick attributes', () => {
    const html = '<button onclick="alert(\'xss\')">Click</button>';
    const { container } = render(<SafeHTML html={html} />);
    
    const button = container.querySelector('button');
    // Button tag is not in allowed list, so it should be removed
    expect(button).not.toBeInTheDocument();
  });

  test('should allow lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const { container } = render(<SafeHTML html={html} />);
    
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  test('should allow blockquotes', () => {
    const html = '<blockquote>Quote</blockquote>';
    const { container } = render(<SafeHTML html={html} />);
    
    expect(container.querySelector('blockquote')).toBeInTheDocument();
  });

  test('should allow code blocks', () => {
    const html = '<pre><code>const x = 1;</code></pre>';
    const { container } = render(<SafeHTML html={html} />);
    
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(container.querySelector('code')).toBeInTheDocument();
  });

  test('should handle complex nested HTML', () => {
    const html = `
      <div>
        <h2>Title</h2>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `;
    const { container } = render(<SafeHTML html={html} />);
    
    // Div is not in allowed list, but content inside should be preserved
    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();
    expect(container.querySelector('ul')).toBeInTheDocument();
  });
});
