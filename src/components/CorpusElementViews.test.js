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
            search: {highlights: new Map()}
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

test('render a view <emph><w>le</w></emph><seg n="1"><w>vel</w></seg><w>i</w>', async () => {
    const { getByTestId } = renderUtterance(`<u who="#EDint330_S2"
    xml:id="EDint330_u_482">
     <w xml:id="xTok_EDint330_006949"
        ana="#JJfJJ"
        lemma="higher">higher</w>
     <emph xml:id="EDint330_d2e16501">
         <w xml:id="xTok_EDint330_006952"
            part="I"
            next="#xTok_EDint330_006953"
            ana="#NNfNN"
            lemma="level">le</w>
     </emph>
     <seg n="1"
          type="overlap"
          xml:id="EDint330_ol_248">
         <w xml:id="xTok_EDint330_006953"
            part="F"
            prev="#xTok_EDint330_006952">vel</w>
     </seg>
     <w xml:id="xTok_EDint330_006956"
        ana="#PPfPP"
        lemma="i">i</w>
     <w xml:id="xTok_EDint330_006958"
        ana="#VVPfVVP"
        lemma="feel">feel</w>
 </u>`)
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    expect(line).toContainHTML('<span class="tag-w" title="Lemma: higher">higher</span> <span class="tag-emph"><span class="tag-w" title="Lemma: level">le</span></span><span class="tag-seg type-overlap n-1 has-n"><span class="fx-overlap">&lt;1&gt;</span><span class="tag-w">vel</span> <span class="fx-overlap">&lt;/1&gt; </span></span><span class="tag-w" title="Lemma: i">i</span> <span class="tag-w" title="Lemma: feel">feel</span> ')
})

test('render a view <anchor/><w join="right">it</w><w join="left">\'s</w><w>not</w>', async () => {
    const { getByTestId } = renderUtterance(`<u who="#EDwsd304_S10" xml:id="EDwsd304_u_332">
                    <anchor synch="#EDwsd304_oc_80" type="other_continuation" xml:id="EDwsd304_oc_81"/>
                    <w join="right" xml:id="xTok_EDwsd304_008761" ana="#PPfPP" lemma="it">it</w>
                    <w join="left" xml:id="xTok_EDwsd304_008763" ana="#VBSfVBS" lemma="be">'s</w>
                    <w xml:id="xTok_EDwsd304_008765" ana="#RBfRB" lemma="not">not</w>                
                </u>`)
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    expect(line).toContainHTML('<span class="tag-anchor type-other_continuation"><span class="fx-other-continuation">=</span></span><span class="tag-w" title="Lemma: it">it</span><span class="tag-w" title="Lemma: be">\'s</span> <span class="tag-w" title="Lemma: not">not</span>')
})

test('render a POS single line view <anchor/><w join="right">it</w><w join="left">\'s</w><w>not</w>', async () => {
    const { getByTestId } = renderUtterance(`<u who="#EDwsd304_S10" xml:id="EDwsd304_u_332">
                    <anchor synch="#EDwsd304_oc_80" type="other_continuation" xml:id="EDwsd304_oc_81"/>
                    <w join="right" xml:id="xTok_EDwsd304_008761" ana="#PPfPP" lemma="it">it</w>
                    <w join="left" xml:id="xTok_EDwsd304_008763" ana="#VBSfVBS" lemma="be">'s</w>
                    <w xml:id="xTok_EDwsd304_008765" ana="#RBfRB" lemma="not">not</w>                
                </u>`, 'pos')
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    expect(line).toContainHTML('<span class="tag-anchor type-other_continuation"></span><span class="fx-ana-frm"><span class="tag-w" title="Lemma: it">it</span><span class="fx-ana"><span class="fx-ana-s">_</span><span class="fx-ana-form">PP</span><span class="fx-ana-f fx-ana-f-s">(PP)</span></span></span><span class="fx-ana-frm"><span class="tag-w" title="Lemma: be">\'s</span><span class="fx-ana"><span class="fx-ana-s">_</span><span class="fx-ana-form">VBS</span><span class="fx-ana-f fx-ana-f-s">(VBS)</span></span></span> <span class="tag-w" title="Lemma: not">not<span class="fx-ana"><span class="fx-ana-s">_</span><span class="fx-ana-form">RB</span><span class="fx-ana-f fx-ana-f-s">(RB)</span></span></span>')
})

test('render a view <w part="I">si</w><emph><w part="M">mul</w></emph><w part="F">taneously</w>', async () => {
    const { getByTestId } = renderUtterance(`<u who="#EDwsd304_S10" xml:id="EDwsd304_u_315">
    <w xml:id="xTok_EDwsd304_008479" ana="#VVNfVVN" lemma="play">played</w>
    <w xml:id="xTok_EDwsd304_008481" part="I" next="#xTok_EDwsd304_008482" norm="simultaneously" ana="#RBfRB" lemma="simultaneously">si</w>
    <emph xml:id="EDwsd304_d2e20444">
        <w xml:id="xTok_EDwsd304_008482" part="M" prev="#xTok_EDwsd304_008481" next="#xTok_EDwsd304_008483" norm="____">mul</w>
    </emph>
    <w xml:id="xTok_EDwsd304_008483" part="F" prev="#xTok_EDwsd304_008482" norm="____">taneously</w>
    <w xml:id="xTok_EDwsd304_008485" ana="#INfIN" lemma="in">in</w>
</u>`)
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    expect(line).toContainHTML('<span class="tag-w" title="Lemma: play">played</span> <span class="tag-w" title="Lemma: simultaneously">si</span><span class="tag-emph"><span class="tag-w">mul</span></span><span class="tag-w">taneously</span> <span class="tag-w" title="Lemma: in">in</span> ')
})

test('render spel without the continuous representation <w xml:id="xTok_EDwsd303_001273" voice:mode="spelt" orig="i d" norm="s_id" ana="#SPfSP" lemma="">id</w>', async () => {
    const { getByTestId } = renderUtterance(`<u who="#EDwsd303_S1" xml:id="EDwsd303_u_107">
    <w xml:id="xTok_EDwsd303_001267" ana="#VHZfVHZ" lemma="have">has</w>
    <w xml:id="xTok_EDwsd303_001269" ana="#DTfDT" lemma="the">the</w>
    <w xml:id="xTok_EDwsd303_001271" ana="#JJfJJ" lemma="same">same</w>
    <w xml:id="xTok_EDwsd303_001273" voice:mode="spelt" orig="i d" norm="s_id" ana="#SPfSP" lemma="">id</w>
    <pause xml:id="EDwsd303_d2e3769"/>
    <w xml:id="xTok_EDwsd303_001275" ana="#INfIN" lemma="with">with</w>
</u>`)
    const line = getByTestId('lineContent')
    await fireEvent.focus(line) // only after some event the rendered TEI appears
    expect(line).toContainHTML("<span class=\"tag-w\" title=\"Lemma: have\">has</span> <span class=\"tag-w\" title=\"Lemma: the\">the</span> <span class=\"tag-w\" title=\"Lemma: same\">same</span> <span class=\"tag-w\"><span class=\"fx-spel\"> &lt;spel&gt; </span><span class=\"fx-spelt-orig\">i d</span><span class=\"fx-spel\"> &lt;/spel&gt; </span></span> <span class=\"tag-pause\"> (.) </span><span class=\"tag-w\" title=\"Lemma: with\">with</span>")
})

function renderUtterance(utteranceXML, aView) {
    const parsed = {},
          view = aView || 'voice'
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
            view: view,
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
                search: {highlights: new Map()}
            }
        }
    })
}