export const createOperation = async (operationData: any): Promise<any> => {
  console.log('[Core Ledger Service Stub] createOperation called with:', operationData);
  return { id: 'mock-op-id', status: 'done', ...operationData };
};
