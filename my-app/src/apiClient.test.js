import {
  adminLogin,
  createUser,
  deleteUserById,
  getUsers,
} from './apiClient';

const buildResponse = (payload, ok = true) =>
  Promise.resolve({
    ok,
    json: async () => payload,
  });

const expectLastFetchUrlToEndWith = (pathSuffix) => {
  const lastCallUrl = global.fetch.mock.calls[global.fetch.mock.calls.length - 1][0];
  expect(lastCallUrl).toEqual(expect.stringMatching(new RegExp(`${pathSuffix}$`)));
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

test('getUsers retourne la liste des utilisateurs', async () => {
  global.fetch.mockResolvedValue(
    buildResponse({
      utilisateurs: [{ id: 1, nom: 'Durand' }],
    })
  );

  const users = await getUsers();

  expect(users).toEqual([{ id: 1, nom: 'Durand' }]);
  expectLastFetchUrlToEndWith('/users');
});

test('getUsers retourne une liste vide si le payload ne contient pas utilisateurs', async () => {
  global.fetch.mockResolvedValue(buildResponse({}));

  const users = await getUsers();

  expect(users).toEqual([]);
});

test('createUser appelle POST /users avec le body attendu', async () => {
  const formData = {
    nom: 'Durand',
    prenom: 'Alice',
    email: 'alice@mail.com',
    dateNaissance: '1998-09-10',
    ville: 'Paris',
    codePostal: '75001',
  };
  global.fetch.mockResolvedValue(buildResponse({ id: 12 }));

  const payload = await createUser(formData);

  expect(payload).toEqual({ id: 12 });
  expectLastFetchUrlToEndWith('/users');
  expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
});

test('adminLogin retourne un token', async () => {
  global.fetch.mockResolvedValue(buildResponse({ token: 'abc123' }));

  const payload = await adminLogin({ username: 'admin', password: 'admin123' });

  expect(payload).toEqual({ token: 'abc123' });
  expectLastFetchUrlToEndWith('/admin/login');
  expect(global.fetch).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      method: 'POST',
    })
  );
});

test('deleteUserById envoie le header admin', async () => {
  global.fetch.mockResolvedValue(buildResponse({ deleted: true }));

  const payload = await deleteUserById(7, 'token-1');

  expect(payload).toEqual({ deleted: true });
  expectLastFetchUrlToEndWith('/users/7');
  expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
    method: 'DELETE',
    headers: {
      'X-Admin-Token': 'token-1',
    },
  });
});

test('adminLogin jette une erreur si credentials invalides', async () => {
  global.fetch.mockResolvedValue(buildResponse({}, false));

  await expect(
    adminLogin({ username: 'admin', password: 'wrong' })
  ).rejects.toThrow('Invalid admin credentials.');
});

test('deleteUserById jette une erreur si la suppression echoue', async () => {
  global.fetch.mockResolvedValue(buildResponse({}, false));

  await expect(deleteUserById(7, 'token-1')).rejects.toThrow('Delete failed.');
});
