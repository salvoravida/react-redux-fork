/*eslint-disable react/prop-types*/

import React from 'react'
import { renderToString } from 'react-dom/server'
import { createStore } from 'redux'
import { Provider, connect } from '../../src/index.js'

describe('React', () => {
  describe('server rendering', () => {
    function greetingReducer(state = { greeting: 'Hello' }, action) {
      return action && action.payload ? action.payload : state
    }

    const Greeting = ({ greeting, greeted }) => greeting + ' ' + greeted
    const ConnectedGreeting = connect(state => state)(Greeting)

    const Greeter = props => (
      <div>
        <ConnectedGreeting {...props} />
      </div>
    )

    it('should be able to render connected component with props and state from store', () => {
      const store = createStore(greetingReducer)

      const markup = renderToString(
        <Provider store={store}>
          <Greeter greeted="world" />
        </Provider>
      )

      expect(markup).toContain('Hello world')
    })

    it('should render with updated state if actions are dispatched before render', () => {
      const store = createStore(greetingReducer)

      store.dispatch({ type: 'Update', payload: { greeting: 'Hi' } })

      const markup = renderToString(
        <Provider store={store}>
          <Greeter greeted="world" />
        </Provider>
      )

      expect(markup).toContain('Hi world')
      expect(store.getState().greeting).toContain('Hi')
    })

    it('should render children with original state even if actions are dispatched in ancestor', () => {
      /*
          Dispatching during construct, render or willMount is
          almost always a bug with SSR (or otherwise)

          This behaviour is undocumented and is likely to change between
          implementations, this test only verifies current behaviour
      */
      const store = createStore(greetingReducer)

      class Dispatcher extends React.Component {
        constructor(props) {
          super(props)
          props.dispatch(props.action)
        }
        UNSAFE_componentWillMount() {
          this.props.dispatch(this.props.action)
        }
        render() {
          this.props.dispatch(this.props.action)

          return <Greeter greeted={this.props.greeted} />
        }
      }
      const ConnectedDispatcher = connect()(Dispatcher)

      const action = { type: 'Update', payload: { greeting: 'Hi' } }

      const markup = renderToString(
        <Provider store={store}>
          <ConnectedDispatcher action={action} greeted="world" />
        </Provider>
      )

      expect(markup).toContain('<div>Hi world</div>')
      expect(store.getState().greeting).toContain('Hi')
    })

    it('should render children with changed state if actions are dispatched in ancestor and new Provider wraps children', () => {
      /*
          Dispatching during construct, render or willMount is
          almost always a bug with SSR (or otherwise)

          This behaviour is undocumented and is likely to change between
          implementations, this test only verifies current behaviour
      */
      const store = createStore(greetingReducer)

      class Dispatcher extends React.Component {
        constructor(props) {
          super(props)
          if (props.constructAction) {
            props.dispatch(props.constructAction)
          }
        }
        UNSAFE_componentWillMount() {
          if (this.props.willMountAction) {
            this.props.dispatch(this.props.willMountAction)
          }
        }
        render() {
          if (this.props.renderAction) {
            this.props.dispatch(this.props.renderAction)
          }

          return (
            <Provider store={store}>
              <Greeter greeted={this.props.greeted} />
            </Provider>
          )
        }
      }
      const ConnectedDispatcher = connect()(Dispatcher)

      const constructAction = { type: 'Update', payload: { greeting: 'Hi' } }
      const willMountAction = { type: 'Update', payload: { greeting: 'Hiya' } }
      const renderAction = { type: 'Update', payload: { greeting: 'Hey' } }

      const markup = renderToString(
        <Provider store={store}>
          <ConnectedDispatcher
            constructAction={constructAction}
            greeted="world"
          />
          <ConnectedDispatcher
            willMountAction={willMountAction}
            greeted="world"
          />
          <ConnectedDispatcher renderAction={renderAction} greeted="world" />
        </Provider>
      )

      expect(markup).toContain('Hi world')
      expect(markup).toContain('Hiya world')
      expect(markup).toContain('Hey world')
      expect(store.getState().greeting).toContain('Hey')
    })
  })
})
