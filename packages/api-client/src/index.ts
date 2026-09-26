export type ApiClientOptions = {
  baseUrl: string;
};

export function createApiClient({ baseUrl }: ApiClientOptions) {
  return {
    async health() {
      const response = await fetch(`${baseUrl}/health`);

      if (!response.ok) {
        throw new Error("Watchnotes API health check failed.");
      }

      return response.json() as Promise<{
        status: string;
        service: string;
      }>;
    },
  };
}
