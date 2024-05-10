import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { HISTORICAL_POOLS_DATA } from './queries'


import { getPercentChange, get2DayPercentChange } from '../../utils/dashboard'
import { apiTimeframeOptions } from '../../constants/apiTimeframeOptions'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
// import { useWhitelistedTokens } from './Application'

const UPDATE = 'UPDATE'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'
const UPDATE_HOURLY_DATA = 'UPDATE_HOURLY_DATA'


async function getBulkPairData(apolloClient: ApolloClient<NormalizedCacheObject>, tokenList: string[]) {
  try {
    let historicalData = await apolloClient.query({
      query: HISTORICAL_POOLS_DATA({
        tokenIds: tokenList,
        periods: [apiTimeframeOptions.oneDay, apiTimeframeOptions.twoDays, apiTimeframeOptions.oneWeek],
      }),
      fetchPolicy: 'cache-first',
    })
    let oneDayData = historicalData?.data?.poolsData.reduce((obj: any, cur:any, i: number) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.period?.[apiTimeframeOptions.oneDay] }
    }, {})

    let twoDayData = historicalData?.data?.poolsData.reduce((obj: any, cur:any, i: number) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.period?.[apiTimeframeOptions.twoDays] }
    }, {})

    let oneWeekData = historicalData?.data?.poolsData.reduce((obj: any, cur:any, i: number) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.period?.[apiTimeframeOptions.oneWeek] }
    }, {})
    let currentData = historicalData?.data?.poolsData.reduce((obj: any, cur:any, i: number) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.pool }
    }, {})


    const poolList = Object.keys(currentData)

    let pairData =
      poolList.map((poolAddress) => {
        let pair = currentData[poolAddress]
        let oneDayHistory = oneDayData?.[pair.poolAddress]
        let twoDayHistory = twoDayData?.[pair.poolAddress]
        let oneWeekHistory = oneWeekData?.[pair.poolAddress]
        const data = parseData(pair, oneDayHistory, twoDayHistory, oneWeekHistory)
        return data
      })
    return pairData
  } catch (e) {
    console.log(e)
    return null
  }
}

function parseData(data: any, oneDayData: any, twoDayData: any, oneWeekData: any) {
  const oneDayVolumeUSD = oneDayData?.volumeUSD || 0
  const twoDayVolumeUSD = twoDayData?.volumeUSD || 0
  const volumeChangeUSD = get2DayPercentChange(oneDayVolumeUSD, twoDayVolumeUSD)

  const oneDayFeesUSD = oneDayData?.feesUSD || 0
  const twoDayFeesUSD = twoDayData?.feesUSD || 0
  const feesChangeUSD = get2DayPercentChange(oneDayFeesUSD, twoDayFeesUSD)

  const oneWeekVolumeUSD = oneWeekData?.volumeUSD || 0
  const newData = {...data}
  // set volume properties
  newData.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  newData.oneWeekVolumeUSD = oneWeekVolumeUSD
  newData.volumeChangeUSD = volumeChangeUSD

  // set fees properties
  newData.oneDayFeesUSD = parseFloat(oneDayFeesUSD);
  newData.feesChangeUSD = feesChangeUSD;

  // set liquidity properties
  newData.liquidityChangeUSD = getPercentChange(oneDayData.totalValueLockedUSD, oneDayData.totalValueLockedUSDFirst)

  return newData
}

export const getAllPools = async (apolloClient: ApolloClient<NormalizedCacheObject>, whitelistedIds: string[] = []) => {
  try {
    const bulkResults = getBulkPairData(apolloClient, whitelistedIds)
    return bulkResults
  } catch (e) {
    console.log(e)
    return null
  }
}
