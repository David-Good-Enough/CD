describe('Admin login', () => {
  it('authenticates as admin', () => {
    cy.visit('http://localhost:3000');

    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.contains('button', 'Connexion admin').click();

    cy.contains('Connecte en admin. Tu peux supprimer des utilisateurs.').should(
      'be.visible'
    );
    cy.contains('button', 'Se deconnecter').should('be.visible');
  });
});
