// Payment options at checkout:
// - 100% payment: 5% off the taxable value (subtotal), GST charged on the discounted value
// - 10% partial: 10% of the full total (GST on the undiscounted subtotal), rest cash on delivery

const round2 = (n: number) => Math.round(n * 100) / 100;

export function getFullPaymentBreakdown(subtotal: number, tax: number) {
  const discount = round2(subtotal * 0.05);
  const taxableValue = round2(subtotal - discount);
  // Discounting every item by 5% reduces its GST by 5% too, whatever its rate
  const gst = round2(tax * 0.95);
  const exactPayable = taxableValue + gst;
  const payable = Math.round(exactPayable);

  return {
    discount,
    taxableValue,
    gst,
    roundOff: round2(payable - exactPayable),
    payable,
    // How much less than the full total the customer pays (discount + GST saved)
    totalSaving: subtotal + tax - payable,
  };
}

export function getPartialPaymentAmount(total: number) {
  return Math.round(total * 0.1);
}

export function formatRupees(amount: number) {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
