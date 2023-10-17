import { Currency } from "@jediswap/sdk";
import React, { useCallback, useEffect, useState } from "react";
import Modal from "../Modal";
import { CurrencySearch } from "./CurrencySearch";
import { ListSelect } from "./ListSelect";
import useLast from "hooks/useLast";

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  showLPTokens?: boolean;
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
  showLPTokens = false
}: CurrencySearchModalProps) {
  const [listView, setListView] = useState<boolean>(false);
  const lastOpen = useLast(isOpen);

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setListView(false);
    }
  }, [isOpen, lastOpen]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect]
  );

  const handleClickChangeList = useCallback(() => {
    setListView(true);
  }, []);
  const handleClickBack = useCallback(() => {
    setListView(false);
  }, []);

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} height={80}>
      {listView ? (
        <ListSelect onDismiss={onDismiss} onBack={handleClickBack} />
      ) : (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          onChangeList={handleClickChangeList}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showLPTokens={showLPTokens}
        />
      )}
    </Modal>
  );
}
