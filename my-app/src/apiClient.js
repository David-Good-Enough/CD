const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des utilisateurs.');
  }
  const payload = await response.json();
  return payload.utilisateurs || [];
}

export async function createUser(formData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'enregistrement.");
  }

  return response.json();
}

export async function adminLogin(credentials) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Invalid admin credentials.');
  }

  return response.json();
}

export async function deleteUserById(userId, adminToken) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    throw new Error('Delete failed.');
  }

  return response.json();
}
