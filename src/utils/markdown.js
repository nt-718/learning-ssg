import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import 'katex/dist/katex.min.css';
import { normalizeMathDelimiters } from './mathDelimiters.js';

marked.setOptions({
  gfm: true,
  breaks: true
});

marked.use(markedKatex({
  throwOnError: false,
  nonStandard: true
}));

export function renderMarkdown(value = '') {
  return marked.parse(normalizeMathDelimiters(value));
}

export function renderMarkdownInline(value = '') {
  return marked.parseInline(normalizeMathDelimiters(value));
}
