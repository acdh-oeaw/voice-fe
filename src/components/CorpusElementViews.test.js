/* eslint-disable no-undef */
import { render, fireEvent, within } from '@testing-library/vue'
import parser from '../functions/SaxParser'
import CorpusElementViews from './CorpusElementViews.vue'

test('render a view', async () => {
   const { getByTestId } = render(CorpusElementViews, {
    props: {
        element: {
            aTopLineUId: 'testid',
            id: '',
            bodyObj: {
                data: {u: {list: [{
                    uId: 'testid',
                    obj: {}
                }]}},
                xmlObj: {}
            },
        },
        view: 'voice',
        mainData: {
            corpus: {},
            views: {voice: {
            utI: {val: 'testid'},
            sId: {val: 'testspeaker'},
            gap: {val: false},
            }},
            search: {highlights: []}
        }
    }
})
   expect(getByTestId('lineContent')).toContainHTML('<div data-testid="lineContent" />')
})

test('render a view <u><w>test</w></u>', async () => {
    const { getByTestId /*, debug*/ } = renderUtterance('<u><w>test</w></u>')
    // debug()
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    // debug()
    expect(within(line).getByText('test')).toBeInTheDocument()
    expect(within(line).getByText('test')).toHaveClass('tag-w')
    expect(line).toContainHTML('<span class="tag-w">test</span>')
})

test('render a view <u><w part="I">te</w><emph><w part="F">st</w></emph><w>next</w></u>', async () => {
    const { getByTestId /*, debug*/ } = renderUtterance('<u><w part="I">te</w><emph><w part="F">st</w></emph><w>next</w></u>')
    // debug()
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    // debug()
    expect(within(line).getByText('te')).toBeInTheDocument()
    expect(within(line).getByText('te')).toHaveClass('tag-w')
    expect(within(line).getByText('st')).toBeInTheDocument()
    expect(within(line).getByText('st')).toHaveClass('tag-w')
    expect(line).toContainHTML('<span class="tag-w">te</span><span class="tag-emph"><span class="tag-w">st</span> </span><span class="tag-w">next</span>')
})

test('render a view <u><w>before</w><emph><w part="I">re</w></emph><w part="F">integration<c function="fall" type="intonation"/></w><w>next</w></u>', async () => {
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

function renderUtterance(utteranceXML) {
    const parsed = {}
    parser.parseIt(utteranceXML, null, null, parsed)
    return render(CorpusElementViews, {
        props: {
            element: {
                aTopLineUId: 'testid',
                id: '',
                bodyObj: {
                    data: {u: {list: [{
                        uId: 'testid',
                        ...parsed
                    }]}},
                    xmlObj: parsed
                },
            },
            view: 'voice',
            mainData: {
                corpus: {},
                views: {voice: {
                utI: {val: 'testid'},
                sId: {val: 'testspeaker'},
                gap: {val: false},
                }},
                search: {highlights: []}
            }
        }
    })
}