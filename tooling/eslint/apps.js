export default [
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@portal/supabase/database',
              importNames: ['Database'],
              message:
                'Please use the application types from your app "~/lib/database.types" instead',
            },
          ],
        },
      ],
    },
  },
];
