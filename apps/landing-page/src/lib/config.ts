export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://vierp.dev',
  githubUrl: 'https://github.com/nclamvn/Viet-ERP',
  email: {
    hello: 'lam.nguyen@vierp.dev',
    support: 'support@vierp.dev',
  },
  social: {
    github: 'https://github.com/nclamvn/Viet-ERP',
    linkedin: 'https://linkedin.com/company/vierp',
  },
} as const;
