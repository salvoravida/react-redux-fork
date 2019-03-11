React Redux Fork
=========================

React Redux, but just up to 98x faster. (Forked from 6.0)

## Installation

React Redux Fork requires **React 16.6 or later.**

```
npm install --save react-redux-fork
```
Using with yarn alias
```
yarn add react-redux@npm:react-redux-fork
```
Fast upgrade with alias your packages.json with yarn alias
```
"react-redux": "npm:react-redux-fork@^6.5.0"
```

## Benchmark
Done with official tool :  https://github.com/reduxjs/react-redux-benchmarks

Results for benchmark deeptree:
FPS Avg : 2.20x - Render Avg : **2.20x**
```
┌────────────┬─────────┬──────────────┬───────────┬───────────┬──────────┬──────────────────────┐
│ Version    │ Avg FPS │ Render       │ Scripting │ Rendering │ Painting │ FPS Values           │
│            │         │ (Mount, Avg) │           │           │          │                      │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼──────────────────────┤
│ 6.0.0      │ 27.00   │ 68.91, 1.96  │ 5925.95   │ 2423.24   │ 1028.30  │ 27,27                │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼──────────────────────┤
│ 6.5.0-fork │ 59.26   │ 65.97, 0.89  │ 2836.54   │ 3903.35   │ 2043.18  │ 59,60,59,60,59,60,60 │
└────────────┴─────────┴──────────────┴───────────┴───────────┴──────────┴──────────────────────┘
```
Results for benchmark forms:
FPS Avg : 1.00x - Render Avg : **9.00x**
```
┌────────────┬─────────┬──────────────┬───────────┬───────────┬──────────┬────────────────────────────┐
│ Version    │ Avg FPS │ Render       │ Scripting │ Rendering │ Painting │ FPS Values                 │
│            │         │ (Mount, Avg) │           │           │          │                            │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼────────────────────────────┤
│ 6.0.0      │ 54.33   │ 752.01, 1.35 │ 3165.75   │ 275.90    │ 853.41   │ 53,55,56,54,55,51,51       │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼────────────────────────────┤
│ 6.5.0-fork │ 54.99   │ 752.70, 0.15 │ 1488.76   │ 260.11    │ 938.07   │ 58,55,54,55,54,55,54,55,55 │
└────────────┴─────────┴──────────────┴───────────┴───────────┴──────────┴────────────────────────────┘
```
Results for benchmark stockticker:
FPS Avg : 2.05x - Render Avg : **14.00x**
```
┌────────────┬─────────┬──────────────┬───────────┬───────────┬──────────┬─────────────────────────┐
│ Version    │ Avg FPS │ Render       │ Scripting │ Rendering │ Painting │ FPS Values              │
│            │         │ (Mount, Avg) │           │           │          │                         │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼─────────────────────────┤
│ 6.0.0      │ 28.82   │ 129.28, 4.05 │ 7540.88   │ 1712.85   │ 547.74   │ 30,29,28,29,28,29,28,28 │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼─────────────────────────┤
│ 6.5.0-fork │ 59.35   │ 130.42, 0.29 │ 4144.02   │ 3913.76   │ 1455.73  │ 60,59,60,59,59          │
└────────────┴─────────┴──────────────┴───────────┴───────────┴──────────┴─────────────────────────┘
```
Results for benchmark tree-view:
FPS Avg : 1.15x - Render Avg : **98.70x**
```
┌────────────┬─────────┬───────────────┬───────────┬───────────┬──────────┬────────────────────────────┐
│ Version    │ Avg FPS │ Render        │ Scripting │ Rendering │ Painting │ FPS Values                 │
│            │         │ (Mount, Avg)  │           │           │          │                            │
├────────────┼─────────┼───────────────┼───────────┼───────────┼──────────┼────────────────────────────┤
│ 6.0.0      │ 44.55   │ 348.76, 12.83 │ 5351.81   │ 2675.88   │ 93.59    │ 46,52,40,43,52,37,39,38,38 │
├────────────┼─────────┼───────────────┼───────────┼───────────┼──────────┼────────────────────────────┤
│ 6.5.0-fork │ 50.89   │ 348.82, 0.13  │ 1974.17   │ 4291.97   │ 164.02   │ 50,57,49,48,49,51,54,49,49 │
└────────────┴─────────┴───────────────┴───────────┴───────────┴──────────┴────────────────────────────┘
```
Results for benchmark twitter-lite:
FPS Avg : 1.03x - Render Avg : **12.70x**
```
┌────────────┬─────────┬──────────────┬───────────┬───────────┬──────────┬─────────────────────────┐
│ Version    │ Avg FPS │ Render       │ Scripting │ Rendering │ Painting │ FPS Values              │
│            │         │ (Mount, Avg) │           │           │          │                         │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼─────────────────────────┤
│ 6.0.0      │ 56.91   │ 2.17, 1.91   │ 7469.43   │ 654.56    │ 127.39   │ 59,60,59,58,53,48,48    │
├────────────┼─────────┼──────────────┼───────────┼───────────┼──────────┼─────────────────────────┤
│ 6.5.0-fork │ 59.38   │ 2.21, 0.15   │ 2271.48   │ 874.72    │ 141.36   │ 59,60,59,60,59,60,59,59 │
└────────────┴─────────┴──────────────┴───────────┴───────────┴──────────┴─────────────────────────┘
```

## Abstract
If you are reading this page, probably you already know that React-Redux 6.x performance aren't very good.
IMHO, this is due to some technical errors:
1) use new React 16 Context to propagate Store value: React Context is very slow, and the common use is the
propagation of values that rarely change like theme or language
2) use of <ReactReduxContext.Consumer> {value=>....  to read value of store : => render prop pattern, even if is a 
common and easy to use react pattern is slow

This fork use the new React Context only for propagate store instance, and do not use Context.Consumer render Prop.

These optimizations require to bump react version to 16.6 (but if you are using React 16.4 should be safe upgrade to 16.6)

**In summary, react-redux-fork restore the performance of react-redux 5.x without Warnings for deprecated React lifycicles and legacy Context,
(React 17 ready) and in some use cases is faster than old 5.x due _React batched updates_, that batched setState to do them in Top-Down mode.**

## Differences from React-Redux 6.0.0
* React version > 16.6 instead of 16.4
* Direct use of <ReactReduxContext.Consumer> { storeValue => ... is no more supported, too slow. use connect instead.
* use context prop on connected components is removed, too slow. Instead use connect(..., options.context:MyCustomContext) if you need custom context (rarely use-case, like libs)
read more about react-redux and context prop here: https://github.com/salvoravida/react-redux-fork/blob/master/context.md

## Why not just a PR to official react-redux project?
Of Course i have done this before doing a fork, but rr manteiners do not seem to be opened to performances fixes :D

Luckily it's an open source project!

## Note 
Someones think that "you may do not need Redux", and that's true for small apps, but if you need it, you are probably working on a large enterprise app,
so not only you need Redux, but you need it with the best possible performances!
That's why i decide to fork this project.

## redux-first-history
If you need performances, i would like to suggest you to have a look to this project https://github.com/salvoravida/redux-first-history
In summary, replace "connected-react-router" with "redux-first-history" to get benefits from the best possible Redux approach:
* one way data-flow
* one unique source of truth

# Feedback
Let me know what do you think! <br>
*Enjoy it? Star this project!* :D

Contributors
------------
See [Contributors](https://github.com/salvoravida/redux-first-history/graphs/contributors).


## License

MIT
