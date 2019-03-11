Some points  about customContext and React-Redux

### 99% You do NOT need customContext on React-Redux
In 99% of Apps you have One Store @ App Root.

If it is your case just use 6.x the SAME EXACT WAY you have already used 5.x
 ```javascript
<Provider store={store}/>
  <App>
   <ConnectedComp />
 </App>
</Provider >
//where
const ConnectedComp = connect(mapState,mapDisp)(Component);
```

### 1% You May need customContext on React-Redux
In 1% of Apps you have to use Two or More Store on the same app.

If it is your case, in both 6.0.0 and 6.5.0 you can have this code
 ```javascript
<Provider store={store} context={CustomContext1}/>
  <App>
       <Provider store={store2} context={CustomContext2}/>
           <ConnectedComponentWithContext1/>
           <ConnectedComponentWithContext2/>
        </Provider > 
  </App>
</Provider >
//where
const ConnectedComponentWithContext1= connect(mapState,mapDispat, { context:CustomContext1 })(Component)
const ConnectedComponentWithContext2= connect(mapState,mapDispat, { context:CustomContext2 })(Component)
```
Also in 6.0.0 you can write an EQUIVALENT way that is no more supported (for performance issue) on 6.5.0

 ```javascript
<Provider store={store} context={CustomContext1}/>
  <App>
       <Provider store={store} context={CustomContext2}/>
           <ConnectedComponent context={CustomContext1} />
           <ConnectedComponent context={CustomContext2}/>
        </Provider > 
  </App>
</Provider >

//where
const ConnectedComponent= connect(mapState,mapDispat)(Component)
```

That's all
