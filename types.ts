
export interface MSTRDataPoint {
  date: string;
  mstrPrice: number;
  btcPrice: number;
  mnavRatio: number;
  premium: number;
}

export interface MSTRStats {
  btcHoldings: number;
  totalShares: number;
  currentMstrPrice: number;
  currentBtcPrice: number;
  mnavRatio: number;
  premium: number;
}
