describe('Admin delete user', () => {
  it('logs in as admin and deletes a user', () => {
    cy.visit('http://localhost:3000');
    cy.contains('li', 'Alice Durand -').should('be.visible');

    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.contains('button', 'Connexion admin').click();
    cy.contains('Connecte en admin. Tu peux supprimer des utilisateurs.').should(
      'be.visible'
    );

    cy.contains('li', 'Alice Durand -').then(($userItem) => {
      const userLine = $userItem.text();
      cy.wrap($userItem).within(() => {
        cy.contains('button', 'Supprimer').click();
      });
      cy.contains('li', userLine).should('not.exist');
    });
  });
});
