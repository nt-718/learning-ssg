// Course parser utility for AnS

import fs from 'fs';
import path from 'path';

// Parse YAML frontmatter block at beginning of markdown string
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: content };
  }

  const yamlStr = match[1];
  const body = match[2];
  const metadata = {};

  yamlStr.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      // Unquote strings or parse arrays
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      } else if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
      } else if (!isNaN(val)) {
        val = Number(val);
      }
      metadata[key] = val;
    }
  });

  return { metadata, body };
}

// Simple TOML parser for course.toml
export function parseToml(tomlContent) {
  const config = { features: {}, categories: {} };
  let currentSection = 'root';

  tomlContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).trim();
      if (!config[currentSection]) config[currentSection] = {};
      return;
    }

    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      } else if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(val)) val = Number(val);

      if (currentSection === 'root') {
        config[key] = val;
      } else {
        config[currentSection][key] = val;
      }
    }
  });

  return config;
}
