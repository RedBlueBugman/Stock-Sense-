// MOCKED REDIS — No Redis server required for hackathon
// All calls pass through directly to the fetch function

export const getOrSetCache = async <T>(
  _key: string, _ttl: number, fetchFunction: () => Promise<T>
): Promise<T> => fetchFunction();

export const invalidateCache = async (_key: string): Promise<void> => {};

export const redis = {
  connect: async () => console.log('[Redis] Mocked — caching disabled'),
  on: () => {},
  get: async () => null,
  setex: async () => {},
  del: async () => {},
  keys: async () => [],
};

export default redis;
