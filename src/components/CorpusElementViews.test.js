/* eslint-disable no-undef */
import Vue from 'vue'
import Vuetify from 'vuetify'
import { render, fireEvent, within } from '@testing-library/vue'
import parser from '../functions/SaxParser'
import CorpusElementViews from './CorpusElementViews.vue'

Vue.use(Vuetify)

// Custom container to integrate Vuetify with Vue Testing Library.
// Vuetify requires you to wrap your app with a v-app component that provides
// a <div data-app="true"> node.
const renderWithVuetify = (component, options, callback) => {
  const root = document.createElement('div')
  root.setAttribute('data-app', 'true')

  return render(
    component,
    {
      container: document.body.appendChild(root),
      // for Vuetify components that use the $vuetify instance property
      vuetify: new Vuetify(),
      ...options,
    },
    callback,
  )
}

test('render a view', async () => {
   const { getByTestId } = renderWithVuetify(CorpusElementViews, {
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
            bookmarks: {
                active: false
            },
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
   // When rendered with such an input the output is just an empty <div/>
   expect(getByTestId('lineContent')).toContainHTML('')
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
    return renderWithVuetify(CorpusElementViews, {
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
                bookmarks: {
                    active: false
                },
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