interface EnvironmentVariables {
  alchemyApiKey: string;
  indexerEndpoint: string;
  labelApiEndpoint: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY || '',
    indexerEndpoint: env.VITE_INDEXER_ENDPOINT || '',
    labelApiEndpoint: env.VITE_LABEL_API_ENDPOINT || '',
  };
}

export default useEnv;
