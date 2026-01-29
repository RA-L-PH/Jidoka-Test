const request = require('supertest');
const app = require('../src/app');
const { connectDatabase, closeDatabase } = require('../src/config/db');

// Test data
const testUser = {
  email: 'tasktest@example.com',
  password: 'testpassword123'
};

const testTask = {
  title: 'Test Task',
  description: 'This is a test task',
  due_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
};

describe('Task Endpoints', () => {
  let authToken;
  let createdTaskId;

  beforeAll(async () => {
    await connectDatabase();
    
    // Register and login user
    await request(app).post('/api/auth/register').send(testUser);
    const loginResponse = await request(app).post('/api/auth/login').send(testUser);
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/tasks', () => {
    it('should create a task successfully', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(testTask.title);
      expect(response.body.data.task.description).toBe(testTask.description);
      expect(response.body.data.task.status).toBe('PENDING');
      
      createdTaskId = response.body.data.task.id;
    });

    it('should fail to create task without title', async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Task without title' })
        .expect(400);
    });

    it('should fail to create task without authentication', async () => {
      await request(app)
        .post('/api/tasks')
        .send(testTask)
        .expect(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.tasks.forEach(task => {
        expect(task.status).toBe('PENDING');
      });
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get('/api/tasks?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a specific task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.id).toBe(createdTaskId);
      expect(response.body.data.task.title).toBe(testTask.title);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .get('/api/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Test Task',
        status: 'IN_PROGRESS'
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updateData.title);
      expect(response.body.data.task.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .put('/api/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should get task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.total).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when trying to delete non-existent task', async () => {
      await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});