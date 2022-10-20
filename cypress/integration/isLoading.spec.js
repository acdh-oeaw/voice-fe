context('isLoading', () => {
    beforeEach(() => {
      const port = Cypress.env('PORT')||'8080'
      cy.visit('http://localhost:' + port)
      cy.viewport(1000, 800)
    })
    it('page title is VOICE 3.0', () => {
      // https://on.cypress.io/title
      cy.title().should('include', 'VOICE 3.0')
    })

    it('consent buttons', () => {
      cy.wait(100)
      cy.get('[data-testid=acceptTracking]')
      cy.get('[data-testid=rejectTracking]')
        .click()
      cy.get('button')
        .contains('Search')
    })

    it('accept tracking', () => {
      cy.wait(300)
      cy.get('[data-testid=acceptTracking]')
        .click()
    // we disabled mtm_consent, TODO make necessary changes to make everything work again
    // cy.getCookie('mtm_consent').should('exist')
    })

    it('revoke tracking', () => {
      cy.wait(300)
      cy.get('[data-testid=acceptTracking]')
        .click()
    // we disabled mtm_consent, TODO make necessary changes to make everything work again
    // cy.getCookie('mtm_consent').should('exist')
      cy.get('[data-testid=revokeTracking]')
        .click()
        .should('not.exist')
    })
  
    it('type search', () => {
      cy.wait(100)
      cy.get('[data-testid=rejectTracking]')
        .click()
      cy.get('input[type=text]')
        .type('translation')
      cy.get('button')
        .contains('Search')
        .click()
      cy.get('img.logo-small')
    })
  
    it('click browse', () => {
      cy.wait(100)
      cy.get('[data-testid=rejectTracking]')
        .click()
      cy.get('a')
        .contains('Browse')
        .click()
        cy.get('img.logo-small')
    })
  
    it('click site notice', () => {
      cy.get('[data-testid=siteNotice]')
        .click()
      cy.get('div')
        .contains('Your visitor ID is')
    })
  })