import { HashRouter, Route, Routes } from "react-router-dom";
import Swap from "../pages/Swap";
import Pool from "../pages/Pool";
// import RedirectDuplicateTokenIdsV2 from "pages/AddLiquidityV2/redirects";
import RedirectDuplicateTokenIds from "pages/AddLiquidity/redirects";

const Router = () => {
  return (
    <Routes>
      <Route path="/swap" element={<Swap />} />

      <Route path="/pool" element={<Pool />} />

      <Route path="add" element={<RedirectDuplicateTokenIds />}>
        <Route path=":currencyIdA" />
        <Route path=":currencyIdA/:currencyIdB" />
      </Route>

      <Route path="/add/:currencyIdA" element={<Swap />} />

      <Route path="/add/:currencyIdA/:currencyIdB" element={<Swap />} />

      <Route path="/create" element={<Swap />} />

      <Route path="/create/:currencyIdA" element={<Swap />} />

      <Route path="/create/:currencyIdA/:currencyIdB" element={<Swap />} />

      <Route path="/zap" element={<Swap />} />

      <Route path="/remove/:currencyIdA/:currencyIdB" element={<Swap />} />
    </Routes>
  );
};

export default Router;
