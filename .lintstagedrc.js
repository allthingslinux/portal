// .lintstagedrc.js
// See https://nextjs.org/docs/basic-features/eslint#lint-staged for details

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
};
