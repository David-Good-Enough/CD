describe('Tests en mode Offline', () => {
  const fillRegistrationForm = () => {
    cy.get('input[name="nom"]').clear().type('Durand');
    cy.get('input[name="prenom"]').clear().type('Alice');
    cy.get('input[name="email"]').clear().type(`alice.offline.${Date.now()}@mail.com`);
    cy.get('input[name="dateNaissance"]').clear().type('1998-09-10');
    cy.get('input[name="ville"]').clear().type('Paris');
    cy.get('input[name="codePostal"]').clear().type('75001');
  };

  beforeEach(() => {
    cy.intercept('GET', '**/users', { statusCode: 200, body: { utilisateurs: [] } }).as(
      'loadUsers'
    );
    cy.visit('http://localhost:3000');
    cy.wait('@loadUsers');
    fillRegistrationForm();
  });

  it('devrait se comporter correctement en ligne', function () {
    if (Cypress.env('offline')) {
      this.skip();
    }

    cy.intercept('POST', '**/users', { statusCode: 200, body: { id: 101 } }).as(
      'syncRequest'
    );
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: {
        utilisateurs: [
          {
            id: 101,
            nom: 'Durand',
            prenom: 'Alice',
            email: 'alice.online@mail.com',
            dateNaissance: '1998-09-10',
            ville: 'Paris',
            codePostal: '75001',
          },
        ],
      },
    }).as('reloadUsers');

    cy.get('[data-cy="btn-sync"]').click();

    cy.wait('@syncRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait('@reloadUsers');
    cy.contains('Inscription enregistree avec succes.').should('be.visible');
  });

  it("devrait afficher un message d'erreur quand le réseau est coupé", function () {
    if (!Cypress.env('offline')) {
      this.skip();
    }

    cy.log('Mode offline active !');
    cy.intercept('POST', '**/users', { forceNetworkError: true }).as('syncRequest');
    cy.get('[data-cy="btn-sync"]').click();

    cy.wait('@syncRequest');
    cy.contains(
      "L'enregistrement a echoue. Verifie que l'API est disponible."
    ).should('be.visible');
  });
});
