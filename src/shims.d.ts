declare module '*.vue' {
  import { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

interface ImportMeta {
  env: {
    VITE_INDEXER_ENDPOINT?: string;
    VITE_LABEL_API_ENDPOINT?: string;
  };
}
