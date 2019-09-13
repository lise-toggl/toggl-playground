import React from "react";

export const loader = () => (
  /**
  * @return an animated "..." loader
  */
  <div className="loader" />
);

export const formatTime = (ms, decimal=false) => {
  /**
   * converts milliseconds to hours or hh:mm:ss
   * @param {number} ms
   * @param {boolean} decimal whether to use the decimal format
   * @return a string with time in decimal or hh:mm:ss format
   */
  if (decimal) {
    return (ms / 3600000).toFixed(2) + " h";
  } else {
    const pad = n => ("0" + n).slice(-2);
    return (
      pad((ms / 3.6e6) | 0) +
      ":" +
      pad(((ms % 3.6e6) / 6e4) | 0) +
      ":" +
      pad(((ms % 6e4) / 1000) | 0)
    );
  }
};

export const formatAmount = (amount) => {
  /**
  * displays amount and currency
  * @param amount either an object with "amount" and "currency" properties, or an array
  * @return a string with the amount and currency (e.g. 20 EUR)
  */
  if (Array.isArray(amount)) {
    return formatAmount(amount[0]);
  }
  if (amount.currency) {
    return amount.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + amount.currency;
  }
  return "";
}