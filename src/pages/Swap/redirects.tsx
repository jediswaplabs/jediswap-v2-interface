// @ts-nocheck
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly({ location }) {
  return <Navigate to={{ ...location, pathname: '/swap' }} replace />;
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap(props) {
  const { location: { search },
    match: { params: { outputCurrency } } } = props;

  return (
    <Navigate
      to={{
        ...props.location,
        pathname: '/swap',
        replace,
        search:
          search && search.length > 1
            ? `${search}&outputCurrency=${outputCurrency}`
            : `?outputCurrency=${outputCurrency}`,
      }}
    />
  );
}
