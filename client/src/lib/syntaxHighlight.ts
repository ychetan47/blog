import Prism from 'prismjs';

// Load requested language components
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-csharp.js';

export const SUPPORTED_LANGUAGES = [
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'sql', label: 'SQL' },
  { id: 'json', label: 'JSON' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'bash', label: 'Bash' },
  { id: 'yaml', label: 'YAML' },
  { id: 'go', label: 'Go' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'plain', label: 'Plain Text' },
];

export function highlightCode(code: string, lang = 'javascript'): string {
  const normalized = lang.toLowerCase();
  const grammar = Prism.languages[normalized] || Prism.languages.javascript || Prism.languages.plain;
  try {
    return Prism.highlight(code, grammar, normalized);
  } catch {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
