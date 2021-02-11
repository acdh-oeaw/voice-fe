context('isLoading', () => {
    beforeEach(() => {
      const port = Cypress.env('PORT')||'3000'
      cy.visit('http://localhost:' + port)
      cy.viewport(1000, 800)
    })
    it('page title is voice-fe', () => {
      // https://on.cypress.io/title
      cy.title().should('include', 'VOICE CLARIAH')
    })
  
    it('type search', () => {
      cy.get('input[type=text]')
        .type('translation')
      cy.get('a')
        .contains('Search')
        .click()
      cy.get('img.logo-small')
    })
  
    it('click browse', () => {
        cy.get('a')
        .contains('Browse')
        .click()
        cy.get('img.logo-small')
    })
  })