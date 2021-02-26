/* eslint-disable no-undef */
import { render, fireEvent, within } from '@testing-library/vue'
import RenderLine from './RenderLine.vue'

test('render a line', async () => {
   const { getByTestId } = render(RenderLine)
   expect(getByTestId('lineContent')).toBeEmptyDOMElement()
})

test('render a line <u><w>test</w></u>', async () => {
    const xmlFixture = 
    `<TEI xmlns="http://www.tei-c.org/ns/1.0"
          xmlns:voice="http://www.univie.ac.at/voice/ns/1.0"
          xmlns:xi="http://www.w3.org/2001/XInclude"
          version="5">
      <u><w>test</w></u>
    </TEI>`
    const { getByTestId /*, debug*/ } = render(RenderLine, {
        props: {
            xmlObjLine: {
                dom:  (new DOMParser()).parseFromString(xmlFixture, "application/xml").getElementsByTagName('u')[0]
            },
            type: 'voice',
            mainData: {views: {voice: [] }}
        }
    })
    // debug()
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    // debug()
    expect(within(line).getByText('test')).toBeInTheDocument()
    expect(within(line).getByText('test')).toHaveClass('tag-w')
    expect(line).toContainHTML('<span class="tag-w">test</span> ')
})