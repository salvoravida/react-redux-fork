import React, { Component } from 'react'
import * as rtl from 'react-testing-library'
import { Provider as ProviderMock, connectAdvanced } from '../../src/index.js'
import { createStore } from 'redux'
import 'jest-dom/extend-expect'

describe('React', () => {
  describe('connectAdvanced', () => {
    it('should map state and render twice on mount if pure', () => {
      const initialState = {
        foo: 'bar'
      }

      let mapCount = 0
      let renderCount = 0

      const store = createStore(() => initialState)

      function Inner(props) {
        renderCount++
        return <div data-testid="foo">{JSON.stringify(props)}</div>
      }

      const Container = connectAdvanced(
        () => {
          return state => {
            mapCount++
            return state
          }
        },
        { pure: true }
      )(Inner)

      const tester = rtl.render(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      expect(tester.getByTestId('foo')).toHaveTextContent('bar')

      expect(mapCount).toEqual(2)
      expect(renderCount).toEqual(1)
    })

    it('should render on reference change', () => {
      let mapCount = 0
      let renderCount = 0

      // force new reference on each dispatch
      const store = createStore(() => ({
        foo: 'bar'
      }))

      function Inner(props) {
        renderCount++
        return <div data-testid="foo">{JSON.stringify(props)}</div>
      }

      const Container = connectAdvanced(
        () => {
          return state => {
            mapCount++
            return state
          }
        },
        { pure: true }
      )(Inner)

      rtl.render(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      rtl.act(() => {
        store.dispatch({ type: 'NEW_REFERENCE' })
      })

      // Should have mapped the state on init, mount, and on the dispatch
      expect(mapCount).toEqual(3)

      // Should have rendered on mount and after the dispatch bacause the map
      // state returned new reference
      expect(renderCount).toEqual(2)
    })

    it('should not render when the returned reference does not change', () => {
      const staticReference = {
        foo: 'bar'
      }

      let mapCount = 0
      let renderCount = 0

      // force new reference on each dispatch
      const store = createStore(() => ({
        foo: 'bar'
      }))

      function Inner(props) {
        renderCount++
        return <div data-testid="foo">{JSON.stringify(props)}</div>
      }

      const Container = connectAdvanced(
        () => {
          return () => {
            mapCount++
            // but return static reference
            return staticReference
          }
        },
        { pure: true }
      )(Inner)

      const tester = rtl.render(
        <ProviderMock store={store}>
          <Container />
        </ProviderMock>
      )

      rtl.act(() => {
        store.dispatch({ type: 'NEW_REFERENCE' })
      })

      expect(tester.getByTestId('foo')).toHaveTextContent('bar')

      // The state should have been mapped twice: on mount and on the dispatch
      expect(mapCount).toEqual(3)

      // But the render should have been called only on mount since the map state
      // did not return a new reference
      expect(renderCount).toEqual(1)
    })

    it('should map state on own props change but not render when the reference does not change', () => {
      const staticReference = {
        foo: 'bar'
      }

      let mapCount = 0
      let renderCount = 0

      const store = createStore(() => staticReference)

      function Inner(props) {
        renderCount++
        return <div data-testid="foo">{JSON.stringify(props)}</div>
      }

      const Container = connectAdvanced(
        () => {
          return () => {
            mapCount++
            // return the static reference
            return staticReference
          }
        },
        { pure: true }
      )(Inner)

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <Container {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      rtl.render(
        <ProviderMock store={store}>
          <OuterComponent ref={c => (outerComponent = c)} />
        </ProviderMock>
      )

      rtl.act(() => {
        outerComponent.setFoo('BAR')
      })

      // map on mount and on prop change
      expect(mapCount).toEqual(3)

      // render only on mount but skip on prop change because no new
      // reference was returned
      expect(renderCount).toEqual(1)
    })
  })
})
