import { sendSuccess, sendPaginated, sendError } from '../../src/shared/response';

describe('Shared Response Formatter Unit Tests', () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should format standard success responses according to spec', () => {
    sendSuccess(mockRes, { name: 'Item 1' });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: { name: 'Item 1' } });
  });

  it('should format paginated meta accurately', () => {
    sendPaginated(mockRes, [{ id: 1 }, { id: 2 }], 50, 1, 20);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: [{ id: 1 }, { id: 2 }],
      meta: {
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      },
    });
  });

  it('should format error responses with code and message', () => {
    sendError(mockRes, 'NOT_FOUND', 'Entity not found', 404);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Entity not found',
      },
    });
  });
});
