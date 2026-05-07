import './App.css';
import { useEffect, useMemo, useState } from 'react';
import {
  calculateAge,
  isValidCodePostal,
  isValidEmail,
  isValidName,
} from './module';

function App() {
  const initialFormData = {
    nom: '',
    prenom: '',
    email: '',
    dateNaissance: '',
    ville: '',
    codePostal: '',
  };

  const initialTouched = {
    nom: false,
    prenom: false,
    email: false,
    dateNaissance: false,
    ville: false,
    codePostal: false,
  };

  const [formData, setFormData] = useState({
    ...initialFormData,
  });
  const [inscrits, setInscrits] = useState([]);
  const [touched, setTouched] = useState({ ...initialTouched });
  const [successToast, setSuccessToast] = useState(false);

  const validateField = (name, value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return 'Ce champ est obligatoire.';
    }

    if (name === 'nom' || name === 'prenom' || name === 'ville') {
      const nomToValidate = name === 'nom' ? trimmedValue : formData.nom.trim();
      const prenomToValidate =
        name === 'prenom' ? trimmedValue : formData.prenom.trim();
      const villeToValidate =
        name === 'ville' ? trimmedValue : formData.ville.trim();

      if (nomToValidate && prenomToValidate && villeToValidate) {
        if (
          !isValidName({
            nom: nomToValidate,
            prenom: prenomToValidate,
            ville: villeToValidate,
          })
        ) {
          return 'Nom, prénom ou ville invalide.';
        }
      }
    }

    if (name === 'email') {
      if (!isValidEmail(trimmedValue)) {
        return 'Veuillez saisir un email valide.';
      }
    }

    if (name === 'codePostal') {
      if (!isValidCodePostal(trimmedValue)) {
        return 'Le code postal doit contenir 5 chiffres.';
      }
    }

    if (name === 'dateNaissance') {
      try {
        const age = calculateAge({ birth: new Date(trimmedValue) });
        if (age < 18) {
          return 'Vous devez avoir au moins 18 ans.';
        }
      } catch (error) {
        return 'Veuillez saisir une date de naissance valide.';
      }
    }

    return '';
  };

  const errors = useMemo(
    () => ({
      nom: validateField('nom', formData.nom),
      prenom: validateField('prenom', formData.prenom),
      email: validateField('email', formData.email),
      dateNaissance: validateField('dateNaissance', formData.dateNaissance),
      ville: validateField('ville', formData.ville),
      codePostal: validateField('codePostal', formData.codePostal),
    }),
    [formData]
  );

  const isFormValid = Object.values(errors).every((error) => error === '');

  useEffect(() => {
    if (!successToast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setSuccessToast(false);
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [successToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({
      nom: true,
      prenom: true,
      email: true,
      dateNaissance: true,
      ville: true,
      codePostal: true,
    });

    if (!isFormValid) {
      return;
    }

    setInscrits((previous) => [
      ...previous,
      {
        id: Date.now(),
        ...formData,
      },
    ]);

    setSuccessToast(true);
    setFormData({ ...initialFormData });
    setTouched({ ...initialTouched });
  };

  return (
    <div className="App">
      <main className="App-content">
        <h1>Inscription utilisateur</h1>
        {successToast ? (
          <div className="toast-success" role="status" aria-live="polite">
            Inscription enregistree avec succes.
          </div>
        ) : null}

        <form className="inscription-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <input
              type="text"
              name="nom"
              aria-label="Nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.nom && errors.nom ? (
              <p className="error-message">{errors.nom}</p>
            ) : null}
          </div>
          <div className="field-group">
            <input
              type="text"
              name="prenom"
              aria-label="Prénom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.prenom && errors.prenom ? (
              <p className="error-message">{errors.prenom}</p>
            ) : null}
          </div>
          <div className="field-group">
            <input
              type="email"
              name="email"
              aria-label="Email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email ? (
              <p className="error-message">{errors.email}</p>
            ) : null}
          </div>
          <div className="field-group">
            <input
              type="date"
              name="dateNaissance"
              aria-label="Date de naissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.dateNaissance && errors.dateNaissance ? (
              <p className="error-message">{errors.dateNaissance}</p>
            ) : null}
          </div>
          <div className="field-group">
            <input
              type="text"
              name="ville"
              aria-label="Ville"
              placeholder="Ville"
              value={formData.ville}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.ville && errors.ville ? (
              <p className="error-message">{errors.ville}</p>
            ) : null}
          </div>
          <div className="field-group">
            <input
              type="text"
              name="codePostal"
              aria-label="Code postal"
              placeholder="Code postal"
              value={formData.codePostal}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.codePostal && errors.codePostal ? (
              <p className="error-message">{errors.codePostal}</p>
            ) : null}
          </div>
          <button type="submit" disabled={!isFormValid}>
            Sauvegarder
          </button>
        </form>

        <section className="inscrits-section">
          <h2>Liste des inscrits</h2>
          {inscrits.length === 0 ? (
            <p>Aucun inscrit pour le moment.</p>
          ) : (
            <ul>
              {inscrits.map((inscrit) => (
                <li key={inscrit.id}>
                  {inscrit.prenom} {inscrit.nom} - {inscrit.email} - ne(e) le{' '}
                  {inscrit.dateNaissance} - {inscrit.ville} ({inscrit.codePostal})
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
