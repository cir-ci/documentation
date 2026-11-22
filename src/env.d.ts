// Starlight's virtual module of the resolved `starlight()` options; only the sidebar is read (src/lib/seo.ts).
declare module 'virtual:starlight/user-config' {
  const config: { sidebar: unknown }
  export default config
}
