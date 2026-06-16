import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as moduleUtils from './module';

const buildResponse = (payload, ok = true) =>
  Promise.resolve({
    ok,
    json: async () => payload,
  });

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('Nom'), {
    target: { value: 'Barrault' },
  });
  fireEvent.change(screen.getByLabelText('Prénom'), {
    target: { value: 'Thomas' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'Thomas.Barrault@mail.com' },
  });
  fireEvent.change(screen.getByLabelText('Date de naissance'), {
    target: { value: '2000-07-14' },
  });
  fireEvent.change(screen.getByLabelText('Ville'), {
    target: { value: 'Nice' },
  });
  fireEvent.change(screen.getByLabelText('Code postal'), {
    target: { value: '06640' },
  });
};

beforeEach(() => {
  // Keep default API call pending to avoid async setState warnings
  // in tests that don't assert the initial load behavior.
  global.fetch = jest.fn(() => new Promise(() => {}));
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});


test('desactive le bouton tant que le formulaire est invalide', () => {
  render(<App />);

  const button = screen.getByRole('button', { name: 'Sauvegarder' });
  expect(button).toBeDisabled();

  fireEvent.change(screen.getByLabelText('Nom'), {
    target: { value: 'Barrault' },
  });
  fireEvent.change(screen.getByLabelText('Prénom'), {
    target: { value: 'Thomas' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'Thomas.Barrault@mail.com' },
  });
  fireEvent.change(screen.getByLabelText('Date de naissance'), {
    target: { value: '2000-07-14' },
  });
  fireEvent.change(screen.getByLabelText('Ville'), {
    target: { value: 'Nice' },
  });
  fireEvent.change(screen.getByLabelText('Code postal'), {
    target: { value: '06640' },
  });

  expect(button).toBeEnabled();
});

test('affiche une erreur sous un champ invalide', () => {
  render(<App />);

  const emailField = screen.getByLabelText('Email');

  fireEvent.change(emailField, {
    target: { value: 'email-invalide' },
  });
  fireEvent.blur(emailField);

  expect(
    screen.getByText('Veuillez saisir un email valide.')
  ).toBeInTheDocument();
});

test('affiche une erreur si nom, prénom ou ville sont invalides', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Nom'), {
    target: { value: 'Barrault' },
  });
  fireEvent.change(screen.getByLabelText('Prénom'), {
    target: { value: 'Thomas' },
  });
  fireEvent.change(screen.getByLabelText('Ville'), {
    target: { value: 'Ni!ce' },
  });
  fireEvent.blur(screen.getByLabelText('Ville'));

  expect(screen.getByText('Nom, prénom ou ville invalide.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sauvegarder' })).toBeDisabled();
});

test('affiche une erreur si code postal invalide', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Code postal'), {
    target: { value: '06A40' },
  });
  fireEvent.blur(screen.getByLabelText('Code postal'));

  expect(
    screen.getByText('Le code postal doit contenir 5 chiffres.')
  ).toBeInTheDocument();
});

test('affiche une erreur si date de naissance invalide', () => {
  render(<App />);
  const calculateAgeSpy = jest
    .spyOn(moduleUtils, 'calculateAge')
    .mockImplementation(() => {
      throw new Error('date invalid');
    });

  fireEvent.change(screen.getByLabelText('Date de naissance'), {
    target: { value: '2000-07-14' },
  });
  fireEvent.blur(screen.getByLabelText('Date de naissance'));

  expect(
    screen.getByText('Veuillez saisir une date de naissance valide.')
  ).toBeInTheDocument();
  calculateAgeSpy.mockRestore();
});

test('ne sauvegarde pas quand le formulaire est invalide meme en submit direct', () => {
  const { container } = render(<App />);

  const form = container.querySelector('form');
  fireEvent.submit(form);

  expect(
    screen.queryByText('Inscription enregistree avec succes.')
  ).not.toBeInTheDocument();
  expect(screen.getByText('Aucun inscrit pour le moment.')).toBeInTheDocument();
});

test('bloque les utilisateurs de moins de 18 ans', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Nom'), {
    target: { value: 'Barrault' },
  });
  fireEvent.change(screen.getByLabelText('Prénom'), {
    target: { value: 'Thomas' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'Thomas.Barrault@mail.com' },
  });
  fireEvent.change(screen.getByLabelText('Date de naissance'), {
    target: { value: '2010-07-14' },
  });
  fireEvent.blur(screen.getByLabelText('Date de naissance'));
  fireEvent.change(screen.getByLabelText('Ville'), {
    target: { value: 'Nice' },
  });
  fireEvent.change(screen.getByLabelText('Code postal'), {
    target: { value: '06640' },
  });

  expect(
    screen.getByText('Vous devez avoir au moins 18 ans.')
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sauvegarder' })).toBeDisabled();
});

test("affiche une erreur si le chargement initial via l'API echoue", async () => {
  global.fetch = jest.fn(() => buildResponse({}, false));
  render(<App />);

  expect(
    await screen.findByText("Impossible de charger les inscrits depuis l'API.")
  ).toBeInTheDocument();
});

test("affiche une erreur si l'enregistrement via l'API echoue", async () => {
  global.fetch
    .mockImplementationOnce(() => buildResponse({ utilisateurs: [] }))
    .mockImplementationOnce(() => buildResponse({}, false));

  render(<App />);
  fillValidForm();
  fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }));

  expect(
    await screen.findByText("L'enregistrement a echoue. Verifie que l'API est disponible.")
  ).toBeInTheDocument();
});

test('affiche la liste des inscrits chargee depuis l API', async () => {
  global.fetch = jest.fn(() =>
    buildResponse({
      utilisateurs: [
        {
          id: 42,
          nom: 'Durand',
          prenom: 'Alice',
          email: 'alice.durand@mail.com',
          dateNaissance: '1998-09-10',
          ville: 'Paris',
          codePostal: '75001',
        },
      ],
    })
  );

  render(<App />);

  expect(
    await screen.findByText(
      /Alice Durand - alice\.durand@mail\.com - ne\(e\) le 1998-09-10 - Paris \(75001\)/
    )
  ).toBeInTheDocument();
});

test('affiche le toaster de succes, vide le formulaire et ajoute l inscrit', async () => {
  jest.useFakeTimers();
  global.fetch
    .mockImplementationOnce(() => buildResponse({ utilisateurs: [] }))
    .mockImplementationOnce(() => buildResponse({ id: 1 }))
    .mockImplementationOnce(() =>
      buildResponse({
        utilisateurs: [
          {
            id: 1,
            nom: 'Barrault',
            prenom: 'Thomas',
            email: 'Thomas.Barrault@mail.com',
            dateNaissance: '2000-07-14',
            ville: 'Nice',
            codePostal: '06640',
          },
        ],
      })
    );
  render(<App />);
  fillValidForm();

  fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }));

  expect(
    await screen.findByText('Inscription enregistree avec succes.')
  ).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByLabelText('Nom')).toHaveValue('');
    expect(screen.getByLabelText('Prénom')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Date de naissance')).toHaveValue('');
    expect(screen.getByLabelText('Ville')).toHaveValue('');
    expect(screen.getByLabelText('Code postal')).toHaveValue('');
  });

  expect(
    await screen.findByText(
      /Thomas Barrault - Thomas\.Barrault@mail\.com - ne\(e\) le 2000-07-14 - Nice \(06640\)/
    )
  ).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(2500);
  });

  expect(
    screen.queryByText('Inscription enregistree avec succes.')
  ).not.toBeInTheDocument();
});
