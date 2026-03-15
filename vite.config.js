import { defineConfig } from 'vite';

const repoBasePath = '/biomech-retro-horror/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? repoBasePath : '/',
  server: {
    host: true
  }
}));
