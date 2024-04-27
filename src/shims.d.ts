declare module '*.vue' {
  import { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

interface ImportMeta {
  env: {
    VITE_ALCHEMY_API_KEY?: string;
    VITE_INDEXER_ENDPOINT?: string;
  };
}
