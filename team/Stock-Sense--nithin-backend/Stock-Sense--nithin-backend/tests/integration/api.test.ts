import request from 'supertest';
import app from '../../src/app';

describe('API Integration & Validation Tests', () => {
  it('GET /health - returns 200 and system health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('Member 3');
  });

  it('GET /api/v1/units-of-measure - returns standard cached UoMs', async () => {
    const res = await request(app).get('/api/v1/units-of-measure');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/references/operation-statuses - returns allowed state transitions', async () => {
    const res = await request(app).get('/api/v1/references/operation-statuses');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('allowed_transitions');
  });

  it('POST /api/v1/products - fails validation when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'A' }); // Name too short (<2 chars) and missing sku

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('GET /api/v1/products - rejects limit > 100 as per specification rules', async () => {
    const res = await request(app).get('/api/v1/products?limit=250');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /unknown-route - returns standardized 404 error payload', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
