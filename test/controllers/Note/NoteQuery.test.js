const request = require('supertest');

const {
  beforeAction,
  afterAction,
} = require('../../helpers/setup');
const { getAccessToken } = require('../../helpers/getAccessToken');

const User = require('../../../api/models/User/User');
const Note = require('../../../api/models/Note/Note');

let api;
let token;

beforeAll(async () => {
  api = await beforeAction();
  token = await getAccessToken();
});

afterAll(() => {
  afterAction();
});

test('Note | query', async () => {
  const user = await User.create({
    email: 'felix@test7.com',
  });

  await Note.create({
    userId: user.id,
    note: 'test',
  });

  const query = `
    {
      note (
        userId: ${user.id}
      ) {
        id
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
    .send({ query })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.note[0].note).toBe('test');
});
