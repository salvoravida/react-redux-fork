import hoistStatics from 'hoist-non-react-statics'
import invariant from 'invariant'
import React, { Component, PureComponent } from 'react'
import { isValidElementType, isContextConsumer } from 'react-is'

import { ReactReduxContext } from './Context'
import Subscription from '../utils/Subscription'

const stringifyComponent = Comp => {
  try {
    return JSON.stringify(Comp)
  } catch (err) {
    return String(Comp)
  }
}

let hotReloadingVersion = 0
const dummyState = {}
function noop() {}

function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  const selector = {
    run: function runComponentSelector(props) {
      try {
        const nextProps = sourceSelector(store.getState(), props)
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true
          selector.props = nextProps
          selector.error = null
        }
      } catch (error) {
        selector.shouldComponentUpdate = true
        selector.error = error
      }
    }
  }

  return selector
}

export default function connectAdvanced(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:

      export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)

    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.

    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */
  selectorFactory,
  // options object:
  {
    // the func used to compute this HOC's displayName from the wrapped component's displayName.
    // probably overridden by wrapper functions such as connect()
    getDisplayName = name => `ConnectAdvanced(${name})`,

    // shown in error messages
    // probably overridden by wrapper functions such as connect()
    methodName = 'connectAdvanced',

    // REMOVED: if defined, the name of the property passed to the wrapped element indicating the number of
    // calls to render. useful for watching in react devtools for unnecessary re-renders.
    renderCountProp = undefined,

    // determines whether this HOC subscribes to store changes
    shouldHandleStateChanges = true,

    // REMOVED: the key of props/context to get the store
    storeKey = 'store',

    // REMOVED: expose the wrapped component via refs
    withRef = false,

    // use React's forwardRef to expose a ref of the wrapped component
    forwardRef = false,

    // the context consumer to use
    context = ReactReduxContext,

    // additional options are passed through to the selectorFactory
    ...connectOptions
  } = {}
) {
  invariant(
    renderCountProp === undefined,
    `renderCountProp is removed. render counting is built into the latest React dev tools profiling extension`
  )

  invariant(
    !withRef,
    'withRef is removed. To access the wrapped instance, use a ref on the connected component'
  )

  const customStoreWarningMessage =
    'To use a custom Redux store for specific components,  create a custom React context with ' +
    "React.createContext(), and pass the context object to React Redux's Provider and specific components" +
    ' like:  <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' +
    'You may also pass a {context : MyContext} option to connect'

  invariant(
    storeKey === 'store',
    'storeKey has been removed and does not do anything. ' +
      customStoreWarningMessage
  )

  const version = hotReloadingVersion++

  const Context = context

  return function wrapWithConnect(WrappedComponent) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        isValidElementType(WrappedComponent),
        `You must pass a component to the function returned by ` +
          `${methodName}. Instead received ${stringifyComponent(
            WrappedComponent
          )}`
      )
    }

    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = getDisplayName(wrappedComponentName)

    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }

    const { pure } = connectOptions

    let OuterBaseComponent = Component

    if (pure) {
      OuterBaseComponent = PureComponent
    }

    function makeDerivedPropsSelector() {
      let lastProps
      let lastState
      let lastDerivedProps
      let lastStore
      let lastSelectorFactoryOptions
      let sourceSelector

      return function selectDerivedProps(
        state,
        props,
        store,
        selectorFactoryOptions
      ) {
        if (pure && lastProps === props && lastState === state) {
          return lastDerivedProps
        }

        if (
          store !== lastStore ||
          lastSelectorFactoryOptions !== selectorFactoryOptions
        ) {
          lastStore = store
          lastSelectorFactoryOptions = selectorFactoryOptions
          sourceSelector = selectorFactory(
            store.dispatch,
            selectorFactoryOptions
          )
        }

        lastProps = props
        lastState = state

        const nextProps = sourceSelector(state, props)

        lastDerivedProps = nextProps
        return lastDerivedProps
      }
    }

    function makeChildElementSelector() {
      let lastChildProps,
        lastForwardRef,
        lastChildElement,
        lastComponent,
        lastContextToUse,
        lastContextValue

      return function selectChildElement(
        WrappedComponent,
        childProps,
        ContextToUse,
        contextValue,
        forwardRef
      ) {
        if (
          childProps !== lastChildProps ||
          forwardRef !== lastForwardRef ||
          ContextToUse !== lastContextToUse ||
          WrappedComponent !== lastComponent
        ) {
          lastChildProps = childProps
          lastForwardRef = forwardRef
          lastComponent = WrappedComponent
          lastContextToUse = ContextToUse
          lastContextValue = contextValue

          lastChildElement = (
            <WrappedComponent {...childProps} ref={forwardRef} />
          )

          if (ContextToUse) {
            lastChildElement = (
              <ContextToUse.Provider value={contextValue}>
                {lastChildElement}
              </ContextToUse.Provider>
            )
          }
        }

        return lastChildElement
      }
    }

    class ConnectInner extends OuterBaseComponent {
      constructor(props) {
        super(props)

        this.version = version

        this.store = props[storeKey]
        this.propsMode = props.propsMode

        invariant(
          this.store,
          `Could not find "${storeKey}" in either the context or props of ` +
            `"${displayName}". Either wrap the root component in a <Provider>, ` +
            `or explicitly pass "${storeKey}" as a prop to "${displayName}".`
        )

        this.initSelector()
        this.initSubscription()

        this.state = {
          contextValue: {
            store: this.store,
            subscription: this.propsMode ? undefined : this.subscription
          },
          selector: this.selector,
          lastDerivedProps: this.selector.props,
          lastWrapperProps: props.wrapperProps
        }

        //this.selectDerivedProps = makeDerivedPropsSelector()
        this.selectChildElement = makeChildElementSelector()
        /*
        this.indirectRenderWrappedComponent = this.indirectRenderWrappedComponent.bind(
          this
        )
        */
      }

      componentDidMount() {
        if (!shouldHandleStateChanges) return

        // componentWillMount fires during server side rendering, but componentDidMount and
        // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
        // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
        // To handle the case where a child component may have triggered a state change by
        // dispatching an action in its componentWillMount, we have to re-run the select and maybe
        // re-render.
        this.subscription.trySubscribe()
        this.selector.run(this.props.wrapperProps)
        if (this.selector.shouldComponentUpdate) this.forceUpdate()
      }

      componentWillUnmount() {
        if (this.subscription) this.subscription.tryUnsubscribe()
        this.subscription = null
        this.notifyNestedSubs = noop
        this.store = null
        this.selector.run = noop
        this.selector.shouldComponentUpdate = false
      }

      static getDerivedStateFromProps(props, state) {
        if (!pure || props.wrapperProps !== state.lastWrapperProps) {
          state.selector.run(props.wrapperProps)

          if (!pure || state.selector.shouldComponentUpdate) {
            return {
              lastWrapperProps: props.wrapperProps,
              lastDerivedProps: state.selector.props,
              error: state.selector.error
            }
          }
        }

        return null
      }

      initSelector() {
        const sourceSelector = selectorFactory(
          this.store.dispatch,
          selectorFactoryOptions
        )
        this.selector = makeSelectorStateful(sourceSelector, this.store)
        this.selector.run(this.props.wrapperProps)
      }

      initSubscription() {
        if (!shouldHandleStateChanges) return

        // parentSub's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.

        //const parentSub = (this.propsMode ? this.props : this.context)[
        //  subscriptionKey
        //]
        const parentSub = this.propsMode ? undefined : this.props.subscription

        this.subscription = new Subscription(
          this.store,
          parentSub,
          this.onStateChange.bind(this)
        )

        // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
        // the middle of the notification loop, where `this.subscription` will then be null. An
        // extra null check every change can be avoided by copying the method onto `this` and then
        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
        // listeners logic is changed to not call listeners that have been unsubscribed in the
        // middle of the notification loop.
        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(
          this.subscription
        )
      }

      onStateChange() {
        this.selector.run(this.props.wrapperProps)

        if (!this.selector.shouldComponentUpdate) {
          this.notifyNestedSubs()
        } else {
          this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate
          console.log(
            `${ConnectContextWrapper.displayName}: queueing re-render`
          )
          //this.setState(dummyState)
          //this.forceUpdate()
          this.setState({
            lastDerivedProps: this.selector.props,
            error: this.selector.error
          })
        }
      }

      notifyNestedSubsOnComponentDidUpdate() {
        // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
        // needs to notify nested subs. Once called, it unimplements itself until further state
        // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
        // a boolean check every time avoids an extra method call most of the time, resulting
        // in some perf boost.
        this.componentDidUpdate = undefined
        this.notifyNestedSubs()
      }

      indirectRenderWrappedComponent() {
        // calling renderWrappedComponent on prototype from indirectRenderWrappedComponent bound to `this`
        return this.renderWrappedComponent()
      }
      /*
      renderWrappedComponent() {
        //const { storeState, store } = value

        const { wrapperProps, forwardedRef, ContextToUse } = this.props

        /*
        let storeState = this.store.getState()

        let derivedProps = this.selectDerivedProps(
          storeState,
          wrapperProps,
          store,
          selectorFactoryOptions
        )
        * /
        this.selector.run(wrapperProps)

        if (this.selector.error) {
          throw this.selector.error
        }

        return this.selectChildElement(
          WrappedComponent,
          derivedProps,
          ContextToUse,
          this.state,
          forwardedRef
        )
      }
*/
      render() {
        const { wrapperProps, forwardedRef, ContextToUse } = this.props

        const { lastDerivedProps, error } = this.state
        /*
          let storeState = this.store.getState()

          let derivedProps = this.selectDerivedProps(
            storeState,
            wrapperProps,
            store,
            selectorFactoryOptions
          )
          */
        console.log(`${ConnectContextWrapper.displayName}: rendering`)
        //this.selector.run(wrapperProps)

        if (error) {
          throw error
        }

        return this.selectChildElement(
          WrappedComponent,
          lastDerivedProps, //this.selector.props,
          ContextToUse,
          this.state.contextValue,
          forwardedRef
        )
      }
    }

    let ConnectContextWrapper = (props, contextOrForwardRef) => {
      let ContextToUse = Context
      let forwardedRef = forwardRef ? contextOrForwardRef : undefined
      const { context, store: propsStore, ...wrapperProps } = props

      if (
        context &&
        context.Consumer &&
        isContextConsumer(<context.Consumer />)
      ) {
        ContextToUse = context
      }

      const propsMode = Boolean(propsStore)

      return (
        <ContextToUse.Consumer>
          {contextValue => {
            let store, subscription

            if (propsMode) {
              store = propsStore
            } else {
              invariant(
                contextValue,
                `Could not find "store" in the context of ` +
                  `"${displayName}". Either wrap the root component in a <Provider>, ` +
                  `or pass a custom React context provider to <Provider> and the corresponding ` +
                  `React context consumer to ${displayName} in connect options.`
              )

              store = contextValue.store
              subscription = contextValue.subscription
            }

            return (
              <ConnectInner
                store={propsMode ? propsStore : store}
                subscription={subscription}
                ContextToUse={ContextToUse}
                propsMode={propsMode}
                wrapperProps={props}
                forwardedRef={forwardedRef}
              />
            )
          }}
        </ContextToUse.Consumer>
      )
    }

    ConnectContextWrapper.WrappedComponent = WrappedComponent
    ConnectContextWrapper.displayName = displayName

    if (forwardRef) {
      const forwarded = React.forwardRef(ConnectContextWrapper)

      forwarded.displayName = displayName
      forwarded.WrappedComponent = WrappedComponent
      return hoistStatics(forwarded, WrappedComponent)
    }

    return hoistStatics(ConnectContextWrapper, WrappedComponent)
  }
}
