/**
 * Transparent 4-Way Payment Split & Welfare Ledger Service
 */

function calculatePaymentSplit(totalAmount, customConfig = null) {
  const config = customConfig || {
    workerShare: 80,
    coopShare: 10,
    welfareShare: 6,
    platformShare: 4
  };

  const workerAmount = Math.round((totalAmount * config.workerShare) / 100);
  const coopAmount = Math.round((totalAmount * config.coopShare) / 100);
  const welfareAmount = Math.round((totalAmount * config.welfareShare) / 100);
  // Ensure the math sums up exactly to totalAmount
  const platformAmount = totalAmount - (workerAmount + coopAmount + welfareAmount);

  return {
    totalAmount,
    workerAmount,
    coopAmount,
    welfareAmount,
    platformAmount,
    config
  };
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `INV-SAHAKAR-${year}-${randomPart}`;
}

module.exports = {
  calculatePaymentSplit,
  generateInvoiceNumber
};
