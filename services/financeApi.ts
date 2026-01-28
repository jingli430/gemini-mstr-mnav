
import { MSTRDataPoint, MSTRStats } from '../types';
import { MSTR_CONSTANTS } from '../constants';

export const calculateMNAV = (mstrPrice: number, btcPrice: number, btcHoldings: number, shares: number): MSTRStats => {
  const equityValue = mstrPrice * shares;
  const btcValue = btcPrice * btcHoldings;
  const mnavRatio = equityValue / btcValue;
  const premium = (mnavRatio - 1) * 100;

  return {
    btcHoldings,
    totalShares: shares,
    currentMstrPrice: mstrPrice,
    currentBtcPrice: btcPrice,
    mnavRatio,
    premium
  };
};

export const fetchHistoricalData = async (days: number = 30): Promise<MSTRDataPoint[]> => {
  const data: MSTRDataPoint[] = [];
  const today = new Date();
  
  // Starting values for simulation
  let currentBtc = 95000;
  let currentMstr = 400;

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Simulate some volatility
    const btcPrice = currentBtc * (1 + (Math.random() * 0.04 - 0.02));
    const mstrPrice = currentMstr * (1 + (Math.random() * 0.06 - 0.025));
    
    const stats = calculateMNAV(mstrPrice, btcPrice, MSTR_CONSTANTS.BTC_HOLDINGS, MSTR_CONSTANTS.SHARES_OUTSTANDING);
    
    data.push({
      date: date.toISOString().split('T')[0],
      btcPrice: Math.round(btcPrice),
      mstrPrice: Number(mstrPrice.toFixed(2)),
      mnavRatio: Number(stats.mnavRatio.toFixed(2)),
      premium: Number(stats.premium.toFixed(2))
    });

    currentBtc = btcPrice;
    currentMstr = mstrPrice;
  }
  
  return data;
};
