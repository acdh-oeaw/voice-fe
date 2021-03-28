/* eslint-disable no-undef */
import { render, fireEvent, within } from '@testing-library/vue'
import Mustache from 'mustache'
import RenderLine from './RenderLine.vue'

test('render a line', async () => {
   const { getByTestId } = render(RenderLine)
   expect(getByTestId('lineContent')).toBeEmptyDOMElement()
})

test('render a line <u><w>test</w></u>', async () => {
    const { getByTestId /*, debug*/ } = renderUtterance('<u><w>test</w></u>')
    // debug()
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    // debug()
    expect(within(line).getByText('test')).toBeInTheDocument()
    expect(within(line).getByText('test')).toHaveClass('tag-w')
    expect(line).toContainHTML('<span class="tag-w">test</span>')
})

test('render a line <u><w part="I">te</w><emph><w part="F">st</w></emph><w>next</w></u>', async () => {
    const { getByTestId /*, debug*/ } = renderUtterance('<u><w part="I">te</w><emph><w part="F">st</w></emph><w>next</w></u>')
    // debug()
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    // debug()
    expect(within(line).getByText('te')).toBeInTheDocument()
    expect(within(line).getByText('te')).toHaveClass('tag-w')
    expect(within(line).getByText('st')).toBeInTheDocument()
    expect(within(line).getByText('st')).toHaveClass('tag-w')
    expect(line).toContainHTML('<span class="tag-w">te</span><span class="tag-emph"><span class="tag-w">st</span></span> <span class="tag-w">next</span>')
})

test('render a line <u><w>before</w><emph><w part="I">re</w></emph><w part="F">integration<c function="fall" type="intonation"/></w><w>next</w></u>', async () => {
    const { getByTestId /*, debug*/ } = renderUtterance('<u><w>before</w><emph><w part="I">re</w></emph><w part="F">integration<c function="fall" type="intonation"/></w><w>next</w></u>')
    // debug()
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    // debug()
    expect(within(line).getByText('re')).toBeInTheDocument()
    expect(within(line).getByText('re')).toHaveClass('tag-w')
    expect(within(line).getByText('integration')).toBeInTheDocument()
    expect(within(line).getByText('integration')).toHaveClass('tag-w')
    expect(line).toContainHTML('<span class="tag-w">before</span> <span class="tag-emph"><span class="tag-w">re</span></span><span class="tag-w">integration<span class="tag-c type-intonation">.</span></span> <span class="tag-w">next</span>')
})

const TEIWrapper = `<TEI xmlns="http://www.tei-c.org/ns/1.0"
      xmlns:voice="http://www.univie.ac.at/voice/ns/1.0"
      xmlns:xi="http://www.w3.org/2001/XInclude"
      version="5">
      {{{testXml}}}
</TEI>`

Mustache.parse(TEIWrapper)

function renderUtterance(utteranceXML) {
    const xmlFixture = Mustache.render(TEIWrapper, {testXml: utteranceXML})
    return render(RenderLine, {
        props: {
            xmlObjLine: {
                dom: (new DOMParser()).parseFromString(xmlFixture, "application/xml").getElementsByTagName('u')[0]
            },
            type: 'voice',
            mainData: {views: {voice: [] }}
        }
    })
}