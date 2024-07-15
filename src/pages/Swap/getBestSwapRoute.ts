import { TradeType } from '@jediswap/sdk'
import { CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import FixedReverseHeap from 'mnemonist/fixed-reverse-heap'
import Queue from 'mnemonist/queue'
import _ from 'lodash'

const routingConfig = {
  minSplits: 1,
  maxSplits: 3,
  forceCrossProtocol: false,
}

export async function getBestSwapRoute(routesWithValidQuotes: any[], tradeType: TradeType, percents: number[]) {
  const percentToQuotes: { [percent: number]: any[] } = {}
  for (const routeWithValidQuote of routesWithValidQuotes) {
    if (!percentToQuotes[routeWithValidQuote.percent]) {
      percentToQuotes[routeWithValidQuote.percent] = []
    }
    percentToQuotes[routeWithValidQuote.percent]!.push(routeWithValidQuote)
  }

  console.log('percentToQuotes', percentToQuotes)
  const betRoute = await getBestSwapRouteBy(
    tradeType,
    percentToQuotes,
    percents,
    tradeType === TradeType.EXACT_INPUT
      ? (routeQuote) => routeQuote.outputAmount
      : (routeQuote) => routeQuote.inputAmount
  )
  console.log('betRoute', betRoute)

  return betRoute
}

async function getBestSwapRouteBy(
  routeType: TradeType,
  percentToQuotes: { [percent: number]: any[] },
  percents: number[],
  by: (routeQuote: any) => CurrencyAmount<any>
) {
  // Build a map of percentage to sorted list of quotes, with the biggest quote being first in the list.
  const percentToSortedQuotes = _.mapValues(percentToQuotes, (routeQuotes: any[]) => {
    return routeQuotes.sort((routeQuoteA, routeQuoteB) => {
      if (routeType == TradeType.EXACT_INPUT) {
        return by(routeQuoteA).greaterThan(by(routeQuoteB)) ? -1 : 1
      } else {
        return by(routeQuoteA).lessThan(by(routeQuoteB)) ? -1 : 1
      }
    })
  })

  const quoteCompFn =
    routeType == TradeType.EXACT_INPUT
      ? (a: CurrencyAmount<any>, b: CurrencyAmount<any>) => a.greaterThan(b)
      : (a: CurrencyAmount<any>, b: CurrencyAmount<any>) => a.lessThan(b)

  const sumFn = (currencyAmounts: CurrencyAmount<any>[]): CurrencyAmount<any> => {
    let sum = currencyAmounts[0]!
    for (let i = 1; i < currencyAmounts.length; i++) {
      sum = sum.add(currencyAmounts[i]!)
    }
    return sum
  }

  let bestQuote: CurrencyAmount<any> | undefined
  let bestSwap: any[] | undefined

  // Min-heap for tracking the 5 best swaps given some number of splits.
  const bestSwapsPerSplit = new FixedReverseHeap<{
    quote: CurrencyAmount<any>
    routes: any[]
  }>(
    Array,
    (a, b) => {
      return quoteCompFn(a.quote, b.quote) ? -1 : 1
    },
    3
  )

  const { minSplits, maxSplits, forceCrossProtocol } = routingConfig

  if (!percentToSortedQuotes[100] || minSplits > 1 || forceCrossProtocol) {
    // log.info(
    //   {
    //     percentToSortedQuotes: _.mapValues(
    //       percentToSortedQuotes,
    //       (p) => p.length
    //     ),
    //   },
    //   'Did not find a valid route without any splits. Continuing search anyway.'
    // );
  } else {
    bestQuote = by(percentToSortedQuotes[100][0]!)
    bestSwap = [percentToSortedQuotes[100][0]!]

    for (const routeWithQuote of percentToSortedQuotes[100].slice(0, 5)) {
      bestSwapsPerSplit.push({
        quote: by(routeWithQuote),
        routes: [routeWithQuote],
      })
    }
  }

  // We do a BFS. Each additional node in a path represents us adding an additional split to the route.
  const queue = new Queue<{
    percentIndex: number
    curRoutes: any[]
    remainingPercent: number
    special: boolean
  }>()

  // First we seed BFS queue with the best quotes for each percentage.
  // i.e. [best quote when sending 10% of amount, best quote when sending 20% of amount, ...]
  // We will explore the various combinations from each node.
  for (let i = percents.length; i >= 0; i--) {
    const percent = percents[i]!

    if (!percentToSortedQuotes[percent]) {
      continue
    }

    queue.enqueue({
      curRoutes: [percentToSortedQuotes[percent]![0]!],
      percentIndex: i,
      remainingPercent: 100 - percent,
      special: false,
    })

    if (!percentToSortedQuotes[percent] || !percentToSortedQuotes[percent]![1]) {
      continue
    }

    queue.enqueue({
      curRoutes: [percentToSortedQuotes[percent]![1]!],
      percentIndex: i,
      remainingPercent: 100 - percent,
      special: true,
    })
  }

  let splits = 1

  while (queue.size > 0) {
    bestSwapsPerSplit.clear()

    // Size of the queue at this point is the number of potential routes we are investigating for the given number of splits.
    let layer = queue.size
    splits++

    // If we didn't improve our quote by adding another split, very unlikely to improve it by splitting more after that.
    if (splits >= 3 && bestSwap && bestSwap.length < splits - 1) {
      break
    }

    if (splits > maxSplits) {
      break
    }

    while (layer > 0) {
      layer--

      const { remainingPercent, curRoutes, percentIndex, special } = queue.dequeue()!

      // For all other percentages, add a new potential route.
      // E.g. if our current aggregated route if missing 50%, we will create new nodes and add to the queue for:
      // 50% + new 10% route, 50% + new 20% route, etc.
      for (let i = percentIndex; i >= 0; i--) {
        const percentA = percents[i]!

        if (percentA > remainingPercent) {
          continue
        }

        // At some point the amount * percentage is so small that the quoter is unable to get
        // a quote. In this case there could be no quotes for that percentage.
        if (!percentToSortedQuotes[percentA]) {
          continue
        }

        const candidateRoutesA = percentToSortedQuotes[percentA]!

        // Find the best route in the complimentary percentage that doesn't re-use a pool already
        // used in the current route. Re-using pools is not allowed as each swap through a pool changes its liquidity,
        // so it would make the quotes inaccurate.
        const routeWithQuoteA = findFirstRouteNotUsingUsedPools(curRoutes, candidateRoutesA, forceCrossProtocol)

        if (!routeWithQuoteA) {
          continue
        }

        const remainingPercentNew = remainingPercent - percentA
        const curRoutesNew = [...curRoutes, routeWithQuoteA]

        // If we've found a route combination that uses all 100%, and it has at least minSplits, update our best route.
        if (remainingPercentNew == 0 && splits >= minSplits) {
          const quotesNew = _.map(curRoutesNew, (r) => by(r))
          const quoteNew = sumFn(quotesNew)

          let gasCostL1QuoteToken = CurrencyAmount.fromRawAmount(quoteNew.currency, 0)

          //   if (HAS_L1_FEE.includes(chainId)) {
          //     if (v2GasModel == undefined && v3GasModel == undefined) {
          //       throw new Error("Can't compute L1 gas fees.");
          //     } else {
          //       const v2Routes = curRoutesNew.filter(
          //         (routes) => routes.protocol === Protocol.V2
          //       );
          //       if (v2Routes.length > 0 && V2_SUPPORTED.includes(chainId)) {
          //         if (v2GasModel) {
          //           const v2GasCostL1 = await v2GasModel.calculateL1GasFees!(
          //             v2Routes as V2RouteWithValidQuote[]
          //           );
          //           gasCostL1QuoteToken = gasCostL1QuoteToken.add(
          //             v2GasCostL1.gasCostL1QuoteToken
          //           );
          //         }
          //       }
          //       const v3Routes = curRoutesNew.filter(
          //         (routes) => routes.protocol === Protocol.V3
          //       );
          //       if (v3Routes.length > 0) {
          //         if (v3GasModel) {
          //           const v3GasCostL1 = await v3GasModel.calculateL1GasFees!(
          //             v3Routes as V3RouteWithValidQuote[]
          //           );
          //           gasCostL1QuoteToken = gasCostL1QuoteToken.add(
          //             v3GasCostL1.gasCostL1QuoteToken
          //           );
          //         }
          //       }
          //     }
          //   }

          const quoteAfterL1Adjust =
            routeType == TradeType.EXACT_INPUT
              ? quoteNew.subtract(gasCostL1QuoteToken)
              : quoteNew.add(gasCostL1QuoteToken)

          bestSwapsPerSplit.push({
            quote: quoteAfterL1Adjust,
            routes: curRoutesNew,
          })

          if (!bestQuote || quoteCompFn(quoteAfterL1Adjust, bestQuote)) {
            bestQuote = quoteAfterL1Adjust
            bestSwap = curRoutesNew
          }
        } else {
          queue.enqueue({
            curRoutes: curRoutesNew,
            remainingPercent: remainingPercentNew,
            percentIndex: i,
            special,
          })
        }
      }
    }
  }
  if (!bestSwap) {
    // log.info(`Could not find a valid swap`);
    return undefined
  }

  return bestSwap
}

// We do not allow pools to be re-used across split routes, as swapping through a pool changes the pools state.
// Given a list of used routes, this function finds the first route in the list of candidate routes that does not re-use an already used pool.
const findFirstRouteNotUsingUsedPools = (
  usedRoutes: any[],
  candidateRouteQuotes: any[],
  forceCrossProtocol: boolean
): any | null => {
  const poolAddressSet = new Set()
  const usedPoolAddresses = _(usedRoutes)
    .flatMap((r) => r.poolAddresses)
    .value()

  for (const poolAddress of usedPoolAddresses) {
    poolAddressSet.add(poolAddress)
  }

  const protocolsSet = new Set()
  const usedProtocols = _(usedRoutes)
    .flatMap((r) => r.protocol)
    .uniq()
    .value()

  for (const protocol of usedProtocols) {
    protocolsSet.add(protocol)
  }

  for (const routeQuote of candidateRouteQuotes) {
    const { poolAddresses, protocol } = routeQuote

    if (poolAddresses.some((poolAddress: any) => poolAddressSet.has(poolAddress))) {
      continue
    }

    // This code is just for debugging. Allows us to force a cross-protocol split route by skipping
    // consideration of routes that come from the same protocol as a used route.
    const needToForce = forceCrossProtocol && protocolsSet.size == 1
    if (needToForce && protocolsSet.has(protocol)) {
      continue
    }

    return routeQuote
  }

  return null
}
