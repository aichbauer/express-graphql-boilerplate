const request = require('supertest');

const {
  beforeAction,
  afterAction,
} = require('../../helpers/setup');
const { getAccessToken } = require('../../helpers/getAccessToken');

const { User } = require('../../../api/models');
const { Note } = require('../../../api/models');

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
        note: "create note"
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

  expect(res.body.data.createNote.userId).toBe(user.id);
  expect(res.body.data.createNote.note).toBe('create note');
});

test('Note | updateNote', async () => {
  const user = await User.create({
    email: 'felix@test5.com',
  });

  const note = await Note.create({
    userId: user.id,
    note: 'update note',
  });

  const updateMutation = `
    mutation {
      updateNote(
        id: ${note.id}
        userId: ${user.id}
        note: "update note update"
      ) {
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
    .send({ query: updateMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.updateNote.userId).toBe(user.id);
  expect(res.body.data.updateNote.note).toBe('update note update');
});

test('Note | updateNote | note does not exist', async () => {
  const updateMutation = `
    mutation {
      updateNote(
        id: 9999
        userId: 1
        note: "update"
      ) {
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
    .send({ query: updateMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.updateNote).toBe(null);
  expect(res.body.errors[0].message).toBe('Note with id: 9999 not found!');
});

test('Note | deleteNote', async () => {
  const user = await User.create({
    email: 'felix@test6.com',
  });

  const note = await Note.create({
    userId: user.id,
    note: 'delete note',
  });

  const deleteMutation = `
    mutation {
      deleteNote(
        id: ${note.id}
      ) {
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
    .send({ query: deleteMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.deleteNote.note).toBe('delete note');
});

test('Note | deleteNote | note does not exist', async () => {
  const deleteMutation = `
    mutation {
      deleteNote(
        id: 9999
      ) {
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
    .send({ query: deleteMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.deleteNote).toBe(null);
  expect(res.body.errors[0].message).toBe('Note with id: 9999 not found!');
});
