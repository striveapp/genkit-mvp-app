import { createResource, createSignal, type ParentProps, Show, For } from 'solid-js'
import './App.css'

type Problem = { name: string, role: string, struggle: string }

type Recommendation = {
    "symptom": string, // e.g. "Possible underlying issues: Difficulty with organization and memory, potentially associated with conditions like ADHD or dyslexia.",
    "measure": string, // e.g. "Implement a time-blocking strategy. Break down the day into 30-minute or hour-long blocks and schedule all meetings in advance. Allocate buffer time between meetings to avoid rushing.",
    "follow_up": string, // e.g. "Track the effectiveness of the time-blocking strategy for a week. If there are any improvements in meeting attendance, continue using it. If not, consider exploring other time management techniques or discussing potential accommodations with your manager. ",
    "identified_symptoms": Array<string>, // e.g. [ "Difficulty with organization and memory" ]
}

const fetchRecommendation =
    async (problem: Problem): Promise<null | Recommendation> => {
        const res = await fetch(new URL('/api/streamAction', SERVICE_URL), {
            "credentials": "omit",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(
                { "key": "/flow/striveFlow", "input": { "start": { "input": { "role": problem.role, "problem": problem.struggle } } } }
            ),
            "method": "POST",
            "mode": "cors"
        });
        const result = await res.json()
        try {
            const recommendation: Recommendation = JSON.parse(result.result.operation.result.response.slice(8, -3))
            return recommendation
        } catch (err) {
            console.error(err)
            return null
        }
    }

export const App = () => {
    const [problem, setProblem] = createSignal<Problem>()
    const [recommendationRequest] = createResource(
        problem,
        fetchRecommendation,
    )

    return <>
        <header>
            <img src={`${import.meta.env.BASE_URL}static/logo.png`} width={150} style={{ margin: '0.5rem' }} />
            <h1 class='inter-tight-thin'>STRIVE</h1>
        </header>
        <main>
            <Show
                when={
                    !recommendationRequest.loading &&
                    recommendationRequest.error === undefined &&
                    recommendationRequest() !== undefined
                }
            >
                <p>So {problem()!.name},<br />you may be struggling with:</p>
                <ul>
                    <For each={recommendationRequest()!.identified_symptoms}>
                        {(symptom) => <li>{symptom}</li>}
                    </For>
                </ul>
                <p>A symptom is: {recommendationRequest()!.symptom}</p>
                <p>A measure to improve this is: {recommendationRequest()!.measure}</p>
                <aside>
                    <p>Do you need help with presenting this to your manager?</p>
                    <button type='button'>yes</button>
                </aside>
                <h3>Follow up</h3>
                <p>You should follow up with this.</p>
                <p>{recommendationRequest()!.follow_up}</p>
                <aside>
                    <p>Should I schedule a follow up reminder?</p>
                    <button type='button'>yes</button>
                </aside>
            </Show>
            <Show
                when={!recommendationRequest.loading && recommendationRequest.error !== undefined}
            >
                <pre>{JSON.stringify(recommendationRequest.error)}</pre>
            </Show>
            <Show when={problem() === undefined}>
                <ProblemInput onProblem={setProblem} />
            </Show>
            <Show when={recommendationRequest.loading}>
                <p>Thinking ...</p>
            </Show>
        </main>
    </>
}

const Input = (props: ParentProps<{ id: string, onInput: (value: string) => void }>) => {
    const v = localStorage.getItem(props.id) ?? ''
    props.onInput(v)
    return <input type='text' onInput={e => {
        localStorage.setItem(props.id, e.target.value)
        props.onInput(e.target.value)
    }} value={v} id={props.id} />
}


const TextInput = (props: ParentProps<{ id: string, onInput: (value: string) => void }>) => {
    const v = localStorage.getItem(props.id) ?? ''
    props.onInput(v)
    return <textarea onInput={e => {
        localStorage.setItem(props.id, e.target.value)
        props.onInput(e.target.value)
    }} value={v} id={props.id} />
}

const noop = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    return false
}

const ProblemInput = (props: ParentProps<{ onProblem: (problem: Problem) => void }>) => {
    const [name, setName] = createSignal('')
    const [role, setRole] = createSignal('')
    const [struggle, setStruggle] = createSignal('')
    console.log('foo')
    return <form onSubmit={noop}>
        <h2>Hey <Input id='name' onInput={setName} />, what are you struggling with, today?</h2>
        <p>
            <label>I am a{' '}
                <Input id='role' onInput={setRole} />
            </label> and I struggle with this:{' '}
        </p>
        <p>
            <TextInput id='struggle' onInput={setStruggle} />
        </p>
        <footer>
            <button type='button' onClick={() => {
                props.onProblem({ name: name(), role: role(), struggle: struggle() })
            }}>next</button>
        </footer>
    </form>
}