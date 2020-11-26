context('toolUI', () => {
    beforeEach(() => {
        const port = Cypress.env('PORT') || '3000'
        cy.visit('http://localhost:' + port + '/#/tool')
        cy.viewport(1000, 800)
    })
    it('page title is voice-fe', () => {
        // https://on.cypress.io/title
        cy.title().should('include', 'voice-fe')
    })
    it('type search', () => {
        cy.get('label')
            .contains('Search the VOICE Corpus')
            .then((label) => {
                cy.get('#' + label.attr('for'))
                    .type('translation')
            })
        cy.get('button')
            .contains('Search')
            .click()
        // some change happens?
    })
    it('tree filter bookmark tabs', () => {
        cy.get('a[href="#filter"]')
            .click()
        cy.get('a[href="#bookmarks"]')
            .click()

        cy.get('a[href="#tree"]')
            .click()

    })
    it('tree view click', () => {
        cy.get('.v-treeview-node__label')
            .contains('ED').as('ED')
        cy.get('@ED').click()
        cy.get('@ED').click()
        cy.get('.v-treeview-node__label')
            .contains('LE').as('LE')
        cy.get('@LE').click()
        cy.get('@LE').click()
    })
})