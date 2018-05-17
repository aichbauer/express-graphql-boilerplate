const request = require('supertest');

const {
  beforeAction,
  afterAction,
} = require('../../helpers/setup');
const { getAccessToken } = require('../../helpers/getAccessToken');

const User = require('../../../api/models/User/User');

let api;
let token;

beforeAll(async () => {
  api = await beforeAction();
  token = await getAccessToken();
});

afterAll(() => {
  afterAction();
});

test('User | mutation', async () => {
  const user = await User.create({
    email: 'felix@test1.com',
  });

  const mutation = `
    mutation {
      updateUser(
        id: ${user.id}
        username:"felix"
        email: "felix@test2.com"
      ) {
        id
        username
        email
      }
    }
  `;

  const query = `
  {
    user(
      id: ${user.id}
    ) {
      id
      email
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

  expect(res.body.data.user[0].email).toBe('felix@test1.com');

  const res2 = await request(api)
    .post('/graphql')
    .set('Accept', /json/)
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({ query: mutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res2.body.data.updateUser.username).toBe('felix');
  expect(res2.body.data.updateUser.email).toBe('felix@test2.com');
});
