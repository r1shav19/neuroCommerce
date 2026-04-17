export class BullwhipDetector {
  private demandHistory: number[] = [];
  private inventoryHistory: number[] = [];

  private historySize: number;

  constructor(historySize: number = 10) {
    this.historySize = historySize;
  }

  public recordTick(totalDemand: number, totalInventory: number) {
    this.demandHistory.push(totalDemand);
    this.inventoryHistory.push(totalInventory);

    if (this.demandHistory.length > this.historySize) this.demandHistory.shift();
    if (this.inventoryHistory.length > this.historySize) this.inventoryHistory.shift();
  }

  private calculateVariance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  }

  public isBullwhipDetected(): boolean {
    if (this.demandHistory.length < this.historySize) return false;
    const devVar = this.calculateVariance(this.demandHistory);
    const invVar = this.calculateVariance(this.inventoryHistory);
    if (invVar < 1) return devVar > 20; // fallback if inv doesn't change much
    return devVar > 2 * invVar;
  }
  
  public reset() {
    this.demandHistory = [];
    this.inventoryHistory = [];
  }
}
