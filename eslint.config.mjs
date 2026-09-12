import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "CASE_01_Beginner/**", "CASE_02_Medium/**", "CASE_03_Hard/**", "CASE_05_SILENT_BEACON/**"] },
];

export default config;
