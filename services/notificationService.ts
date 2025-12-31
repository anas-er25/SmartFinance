import { CurrencyCode, CURRENCIES, Transaction } from "../types";

export const createNotificationLinks = (
  balance: number, 
  currency: CurrencyCode, 
  recentTransactions: Transaction[]
) => {
  const config = CURRENCIES[currency];
  const format = (amt: number) => config.position === 'prefix' ? `${config.symbol}${amt}` : `${amt} ${config.symbol}`;
  
  // Check for recent bad spending (last 3 items)
  const badItems = recentTransactions
    .slice(0, 3)
    .filter(t => t.isHarmful || t.isUnnecessary);
  
  let warningMsg = "";
  if (badItems.length > 0) {
    warningMsg = `\n\n⚠️ Analysis Alert: You recently spent on items flagged as Harmful or Unnecessary:\n`;
    badItems.forEach(t => {
      warningMsg += `- ${t.description} (${format(t.amount)}): ${t.analysisReasoning || 'Check this expense.'}\n`;
    });
  }

  const message = `Alert: My SmartFinance balance has dropped below limit. Current Balance: ${format(balance)}.${warningMsg}`;

  // WhatsApp Link
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  // Email Link
  const mailUrl = `mailto:?subject=SmartFinance Alert&body=${encodeURIComponent(message)}`;

  return { waUrl, mailUrl };
};
