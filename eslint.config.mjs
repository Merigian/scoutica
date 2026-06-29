import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "prisma/**",
      "public/**",
      "promo-video/**",
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // React Compiler readiness rules (eslint-plugin-react-hooks v6) are
      // advisory for a codebase not yet using the compiler — keep them as
      // warnings so they don't fail the lint gate but stay visible.
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
];

export default eslintConfig;
