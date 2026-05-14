import { useState } from "react";

export const useViewSheet = () => {
  const [viewSheet, setViewSheet] = useState({
    open: false,
    type: "",
    item: null,
  });

  const openViewSheet = (type, item) => {
    setViewSheet({
      open: true,
      type,
      item,
    });
  };

  return {
    viewSheet,
    setViewSheet,
    openViewSheet,
  };
};