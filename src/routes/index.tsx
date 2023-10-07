import { HashRouter, Route, Routes } from "react-router-dom";
import Swap from "../pages/Swap";
import Pool from "../pages/Pool";
import RedirectDuplicateTokenIdsV2 from "pages/AddLiquidityV2/redirects";

const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/swap" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/pool" element={<Pool />} />
      </Routes>
      <Routes>
        <Route path="/add" element={<Swap />} />
      </Routes>
      <Route path="add/v2" element={<RedirectDuplicateTokenIdsV2 />}>
        <Route path=":currencyIdA" />
        <Route path=":currencyIdA/:currencyIdB" />
      </Route>
      <Routes>
        <Route path="/add/:currencyIdA" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/add/:currencyIdA/:currencyIdB" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/create" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/create/:currencyIdA" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/create/:currencyIdA/:currencyIdB" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/zap" element={<Swap />} />
      </Routes>
      <Routes>
        <Route path="/remove/:currencyIdA/:currencyIdB" element={<Swap />} />
      </Routes>
    </>
  );
};

export default Router;
