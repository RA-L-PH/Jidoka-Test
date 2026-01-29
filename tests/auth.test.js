const request = require('supertest');
const app = require('../src/app');
const { connectDatabase, closeDatabase } = require('../src/config/db');

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('Authentication Endpoints', () => {
  let server;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password_hash).toBeUndefined();
    });

    it('should fail to register with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should fail to register with invalid email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);
    });

    it('should fail to register with short password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: '123'
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail to login with incorrect password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should fail to login with non-existent email', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser);
      authToken = response.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should fail to get profile without token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should fail to get profile with invalid token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});