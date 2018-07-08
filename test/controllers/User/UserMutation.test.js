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

afterAll(async () => {
  await afterAction();
});

test('User | updateUser', async () => {
  const user = await User.create({
    email: 'felix@test1.com',
  });

  const updateMutation = `
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
    .send({ query: updateMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res2.body.data.updateUser.username).toBe('felix');
  expect(res2.body.data.updateUser.email).toBe('felix@test2.com');
});

test('User | updateUser | user does not exist', async () => {
  const updateMutation = `
    mutation {
      updateUser(
        id: 9999
        username: "Hans"
      ) {
        id
        username
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
    .send({ query: updateMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.updateUser).toBe(null);
  expect(res.body.errors[0].message).toBe('User with id: 9999 not found!');
});

test('User | deleteUser', async () => {
  const user = await User.create({
    username: 'felix',
    email: 'felix@test3.com',
  });

  const deleteMutation = `
      mutation {
        deleteUser(
          id: ${user.id}
        ) {
          id
          username
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
    .send({ query: deleteMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.deleteUser.email).toBe('felix@test3.com');
});

test('User | deleteUser | user does not exist', async () => {
  const deleteMutation = `
    mutation {
      deleteUser(
        id: 9999
      ) {
        id
        username
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
    .send({ query: deleteMutation })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body.data.deleteUser).toBe(null);
  expect(res.body.errors[0].message).toBe('User with id: 9999 not found!');
});
