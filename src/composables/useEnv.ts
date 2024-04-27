interface EnvironmentVariables {
  alchemyApiKey: string;
  indexerEndpoint: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY || '',
    indexerEndpoint: env.VITE_INDEXER_ENDPOINT || '',
  };
}

export default useEnv;
