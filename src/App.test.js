import { render, screen } from '@testing-library/react';
import App from './App';
import ArticleBody, { parseBlocks } from './components/ArticleBody';
import { formatEdit } from './components/admin/PostEditor';

const posts = [
  { id: 'a1', title: 'Lead story', excerpt: 'Lead summary', category: 'Policy', featured: true, status: 'published', publishedAt: '2026-01-02T00:00:00Z', readingMinutes: 3 },
  { id: 'b2', title: 'Second story', excerpt: 'Second summary', category: 'Tech', featured: false, status: 'published', publishedAt: '2026-01-01T00:00:00Z', readingMinutes: 2 },
];

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    const body = url.startsWith('/api/categories')
      ? { categories: [{ name: 'Policy', count: 1 }, { name: 'Tech', count: 1 }] }
      : { posts, total: posts.length };
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
  });
});

test('front page shows the lead story, top stories and section links', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { level: 2, name: 'Lead story' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'Second story' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'IPPS' }).length).toBeGreaterThan(0);
  expect((await screen.findAllByRole('link', { name: 'Tech' })).length).toBeGreaterThan(0);
});

test('front page shows an error with a retry button when the API is down', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('offline')));
  render(<App />);
  expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
});

test('article formatting is parsed into blocks', () => {
  expect(parseBlocks('## Title\n\nPara one\nline two\n\n> quote\n\n- a\n- b').map((b) => b.type)).toEqual(['h2', 'p', 'quote', 'list']);
});

test('article text never renders raw HTML', () => {
  const { container } = render(<ArticleBody content={'Hello <img src=x onerror="alert(1)"> **bold** https://wipo.int'} />);
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('strong')).toHaveTextContent('bold');
  expect(container.querySelector('a')).toHaveAttribute('href', 'https://wipo.int');
  expect(container).toHaveTextContent('<img src=x onerror="alert(1)">');
});

describe('editor formatting buttons', () => {
  const apply = (value, start, end, kind) => {
    const edit = formatEdit(value, start, end, kind);
    return value.slice(0, edit.from) + edit.text + value.slice(edit.to);
  };

  test('Heading turns the line under the cursor into a heading, not the end of the article', () => {
    const text = 'Intro paragraph.\n\nMiddle line.\n\nLast paragraph.';
    const cursor = text.indexOf('Middle') + 3;
    expect(apply(text, cursor, cursor, 'heading')).toBe('Intro paragraph.\n\n## Middle line.\n\nLast paragraph.');
  });

  test('Heading on a line inside a paragraph adds the empty lines it needs', () => {
    const text = 'Line one\nLine two\nLine three';
    const cursor = text.indexOf('two');
    expect(apply(text, cursor, cursor, 'heading')).toBe('Line one\n\n## Line two\n\nLine three');
  });

  test('pressing a button twice removes the formatting', () => {
    expect(apply('## Title', 4, 4, 'heading')).toBe('Title');
    expect(apply('> Quote', 3, 3, 'quote')).toBe('Quote');
  });

  test('empty line gets a selected placeholder; List and Bold wrap the selection', () => {
    const edit = formatEdit('', 0, 0, 'heading');
    expect(edit.text).toBe('## Sub-heading');
    expect(edit.select).toEqual([3, 14]);
    expect(apply('a\nb', 0, 3, 'list')).toBe('- a\n- b');
    expect(apply('make this bold', 5, 9, 'bold')).toBe('make **this** bold');
  });
});
