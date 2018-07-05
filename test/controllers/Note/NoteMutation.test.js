const request = require('supertest');

const {
  beforeAction,
  afterAction,
} = require('../../helpers/setup');
const { getAccessToken } = require('../../helpers/getAccessToken');

const User = require('../../../api/models/User/User');
// const Note = require('../../../api/models/Note/Note');

let api;
let token;

beforeAll(async () => {
  api = await beforeAction();
  token = await getAccessToken();
});

afterAll(() => {
  afterAction();
});

test('Note | create, update, delete', async () => {
  const user = await User.create({
    email: 'felix@test4.com',
  });

  const createMutation = `
    mutation {
      createNote(
        userId: ${user.id},
        note: "test note"
      ) {
        id
        userId
        note
      }
    }
  `;

  const res = await request(api)
    .post('/graphql')
    .set('Accept', /json/)
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({ query: createMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  const updateMutation = `
    mutation {
      updateNote(
        id: ${res.body.data.createNote.id}
        userId: ${user.id}
        note: "test note update"
      ) {
        userId
        note
      }
    }
  `;

  const deleteMutation = `
    mutation {
      deleteNote(
        id: ${res.body.data.createNote.id}
      ) {
        note
      }
    }
  `;

  const res2 = await request(api)
    .post('/graphql')
    .set('Accept', /json/)
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({ query: updateMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  const res3 = await request(api)
    .post('/graphql')
    .set('Accept', /json/)
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({ query: deleteMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.createNote.userId).toBe(user.id);
  expect(res.body.data.createNote.note).toBe('test note');

  expect(res2.body.data.updateNote.userId).toBe(user.id);
  expect(res2.body.data.updateNote.note).toBe('test note update');

  expect(res3.body.data.deleteNote.note).toBe('test note update');
});
