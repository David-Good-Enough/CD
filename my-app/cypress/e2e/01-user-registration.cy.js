describe('User registration', () => {
  it('registers a user from the form', () => {
    const email = `alice.registration.${Date.now()}@mail.com`;

    cy.visit('http://localhost:3000');

    cy.get('input[name="nom"]').clear().type('Durand');
    cy.get('input[name="prenom"]').clear().type('Alice');
    cy.get('input[name="email"]').clear().type(email);
    cy.get('input[name="dateNaissance"]').clear().type('1998-09-10');
    cy.get('input[name="ville"]').clear().type('Paris');
    cy.get('input[name="codePostal"]').clear().type('75001');

    cy.contains('button', 'Sauvegarder').click();

    cy.contains('Inscription enregistree avec succes.').should('be.visible');
    cy.contains(
      `Alice Durand - ${email} - ne(e) le 1998-09-10 - Paris (75001)`
    ).should('be.visible');
  });
});
