import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../utils';
import ArticleBody from '../ArticleBody';

const SECTIONS = [
  ['start', 'Getting started'],
  ['write', 'Write a new article'],
  ['format', 'Formatting the text'],
  ['image', 'Adding a picture'],
  ['publish', 'Drafts and publishing'],
  ['headline', 'Headlines (top story)'],
  ['manage', 'Editing, unpublishing and deleting'],
  ['categories', 'Categories'],
  ['tips', 'Tips for good articles'],
  ['faq', 'Problems and questions'],
];

const FORMAT_EXAMPLES = [
  {
    name: 'Paragraphs',
    how: 'Leave one empty line between paragraphs. Pressing Enter once only starts a new line inside the same paragraph.',
    source: 'Bangladesh joined WIPO in 1985.\n\nSince then, the number of patent applications has grown every year.',
  },
  {
    name: 'Sub-heading',
    how: 'Click on an empty line (or on a line you have already written) and press Heading. Or type ## and a space at the start of the line.',
    source: '## Why patents matter\n\nA patent protects an invention for 20 years.',
  },
  {
    name: 'Bold',
    how: 'Select the words and press B (or Ctrl+B). Or put ** on both sides.',
    source: 'Registration is **free for students** this year.',
  },
  {
    name: 'Pull quote',
    how: 'Click on the line with the quote and press “ ”. Or start the line with > and a space.',
    source: '> Protecting ideas is protecting our future.',
  },
  {
    name: 'Bullet list',
    how: 'Select the lines and press • List. Or start each line with - and a space, with no empty lines between items.',
    source: '- Patents\n- Trademarks\n- Copyright',
  },
  {
    name: 'Links',
    how: 'Paste the full address starting with https:// and it becomes clickable.',
    source: 'Read more at https://www.wipo.int',
  },
];

function Step({ n, children }) {
  return (
    <li>
      <span className="guide-step__n" aria-hidden="true">
        {n}
      </span>
      <div>{children}</div>
    </li>
  );
}

export default function Guide() {
  usePageTitle('Admin guide');
  return (
    <div className="guide">
      <div className="admin-head">
        <div>
          <Link to="/admin" className="text-link">
            ← All articles
          </Link>
          <h1>How to use the admin panel</h1>
          <p className="meta">A short guide to writing, publishing and managing articles on IPPS.</p>
        </div>
        <Link to="/admin/new" className="btn">
          + Write an article
        </Link>
      </div>

      <div className="guide__layout">
        <nav className="guide__toc panel" aria-label="Guide sections">
          <h2>On this page</h2>
          <ol>
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="guide__body">
          <section id="start" className="panel">
            <h2>1. Getting started</h2>
            <p>
              Sign in at <code>/admin</code> (there is also an <em>Admin</em> link at the bottom of every page). You stay signed in on this device for 7
              days. Use <strong>Log out</strong> in the dark bar at the top when you are done, especially on a shared computer.
            </p>
            <p>The bar at the top of every admin page has:</p>
            <ul>
              <li>
                <strong>Articles</strong>: the list of every article, published or not.
              </li>
              <li>
                <strong>New article</strong>: opens an empty editor.
              </li>
              <li>
                <strong>Guide</strong>: this page.
              </li>
              <li>
                <strong>View site ↗</strong>: opens the public website in a new tab.
              </li>
            </ul>
            <p>
              On the <Link to="/admin">Articles</Link> page, the four boxes at the top (All, Published, Drafts, Headlines) are filters: click one to show
              only those articles. The search box finds articles by title or category.
            </p>
          </section>

          <section id="write" className="panel">
            <h2>2. Write a new article</h2>
            <ol className="guide-steps">
              <Step n={1}>
                Click <strong>+ New article</strong>.
              </Step>
              <Step n={2}>
                Type the <strong>Headline</strong>. Keep it clear and specific; this is what readers see first.
              </Step>
              <Step n={3}>
                <strong>Summary</strong> is optional. It appears under the headline and on the article cards on the front page. If you leave it empty,
                the first sentences of the article are used.
              </Step>
              <Step n={4}>
                Write or paste the article into the big text box. See <a href="#format">Formatting the text</a> below.
              </Step>
              <Step n={5}>
                In the side boxes (on the right, or below the text on a phone), fill in the <strong>Category</strong> (required) and the <strong>Author</strong> (optional), and add a picture.
              </Step>
              <Step n={6}>
                Click the <strong>Preview</strong> tab to see how the text will look, then <strong>Publish</strong> or <strong>Save draft</strong>. On a
                phone these buttons stay at the bottom of the screen.
              </Step>
            </ol>
            <p className="guide-tip">
              While you have unsaved changes, a yellow <strong>Unsaved changes</strong> label shows at the top. If you try to leave the page, the site
              asks first. Your unsaved text is also kept on this device: if the tab closes or you get logged out, open the article again (or{' '}
              <em>New article</em>) and click <strong>Restore</strong>. A picture you chose but hadn't saved yet needs choosing again.
            </p>
          </section>

          <section id="format" className="panel">
            <h2>3. Formatting the text</h2>
            <p>
              The article box uses simple text marks instead of a Word-style toolbar. The buttons above the box (<strong>Heading</strong>,{' '}
              <strong>B</strong>, <strong>“ ”</strong>, <strong>• List</strong>) add these marks for you. They work on the line where your cursor is, so{' '}
              <strong>click in the text first</strong>, then press the button. Press the same button again to remove the formatting.
            </p>
            <div className="guide-examples">
              {FORMAT_EXAMPLES.map((ex) => (
                <div key={ex.name} className="guide-example">
                  <h3>{ex.name}</h3>
                  <p className="meta">{ex.how}</p>
                  <div className="guide-example__pair">
                    <div>
                      <span className="guide-example__label">You type</span>
                      <pre>{ex.source}</pre>
                    </div>
                    <div>
                      <span className="guide-example__label">Readers see</span>
                      <div className="guide-example__result">
                        <ArticleBody content={ex.source} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="guide-tip">
              Pasting from Word or Google Docs keeps the words but not the styling. After pasting, check the Preview and add headings or bold again
              with the buttons. Bangla text works everywhere.
            </p>
          </section>

          <section id="image" className="panel">
            <h2>4. Adding a picture</h2>
            <ol className="guide-steps">
              <Step n={1}>
                In the <strong>Image</strong> box (on the right, or further down on a phone), click <em>Click to choose an image</em> and pick a JPEG, PNG, WebP or GIF file.
              </Step>
              <Step n={2}>Large photos are made smaller automatically, so you can upload straight from a phone or camera (up to 15MB).</Step>
              <Step n={3}>
                Add a <strong>Caption</strong> if you like, for example who took the photo or what it shows.
              </Step>
              <Step n={4}>
                The picture is uploaded when you click <strong>Publish</strong>, <strong>Update</strong> or <strong>Save draft</strong>. Use{' '}
                <strong>Replace</strong> or <strong>Remove</strong> to change it.
              </Step>
            </ol>
            <p className="guide-tip">
              Landscape (wide) photos look best: the front page and article page crop pictures to a wide shape. Only use pictures you have the right to
              publish.
            </p>
          </section>

          <section id="publish" className="panel">
            <h2>5. Drafts and publishing</h2>
            <ul>
              <li>
                <strong>Save draft</strong> keeps the article private. Readers can't see it. Drafts show as <span className="badge badge--draft">Draft</span>{' '}
                in the list.
              </li>
              <li>
                <strong>Publish</strong> puts the article on the website straight away, on the front page and in its category.
              </li>
              <li>
                For a published article, the buttons become <strong>Update</strong> (save your changes and keep it live) and <strong>Unpublish</strong>{' '}
                (turn it back into a draft and hide it).
              </li>
              <li>
                <strong>View on site ↗</strong> at the top of the editor opens the live article.
              </li>
            </ul>
            <p className="guide-tip">
              Articles are listed newest first, by the date they were first published. Editing an article later does not move it back to the top.
            </p>
          </section>

          <section id="headline" className="panel">
            <h2>6. Headlines (top story)</h2>
            <p>
              Tick <strong>Headline</strong> in the editor, or click the star ☆ next to an article in the list. Headline articles are shown:
            </p>
            <ul>
              <li>as the big top story on the front page (the newest headline article), and</li>
              <li>in the scrolling headlines bar under the menu.</li>
            </ul>
            <p>
              Click the star again to remove an article from the headlines. Keep only a few articles as headlines at a time so the most important news
              stands out. If no article is a headline, the newest article is shown as the top story.
            </p>
          </section>

          <section id="manage" className="panel">
            <h2>7. Editing, unpublishing and deleting</h2>
            <ul>
              <li>
                <strong>Edit</strong>: click the title or the <em>Edit</em> button in the list, change what you need, then click <strong>Update</strong>.
              </li>
              <li>
                <strong>Hide for now</strong>: open the article and click <strong>Unpublish</strong>. You can publish it again later.
              </li>
              <li>
                <strong>Delete</strong>: click <em>Delete</em> in the list and confirm. This removes the article and its picture for good and{' '}
                <strong>cannot be undone</strong>. If you might need it again, unpublish instead.
              </li>
            </ul>
          </section>

          <section id="categories" className="panel">
            <h2>8. Categories</h2>
            <p>
              Every article needs a category. When you type in the Category box, existing categories are suggested: pick one of them so articles are
              grouped together. Typing a new name creates a new category.
            </p>
            <p>
              Categories appear in the main menu and get their own page as soon as they have a published article. Spelling matters:{' '}
              <em>Technology</em> and <em>Tech</em> would be two separate sections.
            </p>
          </section>

          <section id="tips" className="panel">
            <h2>9. Tips for good articles</h2>
            <ul>
              <li>Headlines of 6–12 words work best in the menu cards and when shared on Facebook or WhatsApp.</li>
              <li>Write a one or two sentence summary: it is what people see when the link is shared.</li>
              <li>Use sub-headings every few paragraphs in long articles so readers can skim.</li>
              <li>Always add a picture; articles without one look empty on the front page and when shared.</li>
              <li>Check the Preview before publishing, and open the article on your phone once it is live.</li>
            </ul>
          </section>

          <section id="faq" className="panel">
            <h2>10. Problems and questions</h2>
            <dl className="guide-faq">
              <dt>I was sent back to the login page.</dt>
              <dd>Your session ended (after 7 days, or after logging out). Sign in again and open the article: you'll be offered your unsaved text back. Restore only works on the same device and browser, so save drafts often.</dd>
              <dt>The formatting button asked me to click in the text.</dt>
              <dd>The buttons need to know where to put the formatting. Click on the line you want to change, or select some text, then press it again.</dd>
              <dt>My heading or list shows as normal text.</dt>
              <dd>
                It needs an empty line above and below it, and a space after the mark (<code>## Title</code>, not <code>##Title</code>). Check the Preview
                tab.
              </dd>
              <dt>The picture won't upload.</dt>
              <dd>Use a JPEG, PNG, WebP or GIF under 15MB (GIFs under 3MB). Photos from iPhones in HEIC format must be converted to JPEG first.</dd>
              <dt>I published by mistake.</dt>
              <dd>Open the article and click Unpublish. It disappears from the site right away.</dd>
              <dt>A shared link on Facebook shows an old picture or title.</dt>
              <dd>
                Facebook remembers previews. Paste the link into the{' '}
                <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer">
                  Facebook Sharing Debugger
                </a>{' '}
                and click <em>Scrape Again</em>.
              </dd>
              <dt>How do I change the admin password?</dt>
              <dd>
                The password is set in Netlify: Site configuration → Environment variables → <code>ADMIN_PASSWORD</code>, then redeploy. Changing{' '}
                <code>SESSION_SECRET</code> as well signs everyone out.
              </dd>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
