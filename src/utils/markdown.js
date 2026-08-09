import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import 'katex/dist/katex.min.css';

marked.setOptions({
  gfm: true,
  breaks: true
});

marked.use(markedKatex({
  throwOnError: false,
  nonStandard: true
}));

export { marked };
