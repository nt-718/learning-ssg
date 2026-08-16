function replaceInlineMath(line) {
  return line
    .split(/(`+[^`]*?`+)/g)
    .map((part, index) => index % 2 === 1
      ? part
      : part.replace(/\\\((.+?)\\\)/g, (_, expression) => `$${expression}$`))
    .join('');
}

export function normalizeMathDelimiters(markdown = '') {
  let fenceMarker = null;

  return String(markdown)
    .split('\n')
    .map(line => {
      const fence = line.match(/^\s*(`{3,}|~{3,})/)?.[1] || null;
      if (fence) {
        if (!fenceMarker) {
          fenceMarker = fence;
        } else if (fence[0] === fenceMarker[0] && fence.length >= fenceMarker.length) {
          fenceMarker = null;
        }
        return line;
      }

      if (fenceMarker) return line;

      const trimmed = line.trim();
      if (trimmed === '\\[' || trimmed === '\\]') {
        return line.replace(trimmed, () => '$$');
      }

      return replaceInlineMath(line);
    })
    .join('\n');
}
