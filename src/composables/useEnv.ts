interface EnvironmentVariables {
  alchemyApiKey: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY || '',
  };
}

export default useEnv;
