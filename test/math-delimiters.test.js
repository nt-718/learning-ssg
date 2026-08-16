import test from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { normalizeMathDelimiters } from '../src/utils/mathDelimiters.js';

marked.use(markedKatex({ throwOnError: false, nonStandard: true }));

test('normalizes TeX display delimiters for the KaTeX extension', () => {
  const markdown = '\\[\n\\boxed{x \\rightarrow y}\n\\]';
  const normalized = normalizeMathDelimiters(markdown);
  const html = marked.parse(normalized);

  assert.equal(normalized, '$$\n\\boxed{x \\rightarrow y}\n$$');
  assert.match(html, /class="katex-display"/);
  assert.match(html, /<menclose notation="box">/);
});

test('normalizes TeX inline delimiters', () => {
  const normalized = normalizeMathDelimiters('標本平均 \\(\\bar X\\) を使う。');
  const html = marked.parse(normalized);

  assert.equal(normalized, '標本平均 $\\bar X$ を使う。');
  assert.match(html, /class="katex"/);
});

test('does not rewrite delimiters in code', () => {
  const markdown = '`\\(inline\\)`\n\n```text\n\\[\ncode\n\\]\n```';

  assert.equal(normalizeMathDelimiters(markdown), markdown);
});
