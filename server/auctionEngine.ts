export type ProductId = 'shoes' | 'bags' | 'watches' | 'caps' | 'jackets';

interface Auction {
  id: string; // product + fromStore + timestamp
  requesterId: string;
  product: ProductId;
  unitsNeeded: number;
  urgency: number;
  bids: Array<{
    storeId: string;
    product: ProductId;
    unitsAvailable: number;
    price: number;
    urgencyScore: number;
  }>;
  timeout: NodeJS.Timeout;
}

const activeAuctions = new Map<string, Auction>();

export function createAuction(requesterId: string, product: ProductId, unitsNeeded: number, urgency: number, onComplete: (result: any) => void) {
  const auctionId = `${requesterId}-${product}-${Date.now()}`;
  
  const timeout = setTimeout(() => {
    resolveAuction(auctionId, onComplete);
  }, 2000); // 2 seconds to bid

  activeAuctions.set(auctionId, {
    id: auctionId,
    requesterId,
    product,
    unitsNeeded,
    urgency,
    bids: [],
    timeout
  });

  return auctionId;
}

export function handleBid(auctionId: string, storeId: string, product: ProductId, unitsAvailable: number, price: number, urgencyScore: number) {
  const auction = activeAuctions.get(auctionId);
  if (!auction) return false;

  auction.bids.push({ storeId, product, unitsAvailable, price, urgencyScore });
  return true;
}

function resolveAuction(auctionId: string, onComplete: (result: any) => void) {
  const auction = activeAuctions.get(auctionId);
  if (!auction) return;

  activeAuctions.delete(auctionId);

  if (auction.bids.length === 0) {
    onComplete({ type: 'BID_RESULT', winner: null, product: auction.product, msg: 'No bids received' });
    return;
  }

  // Scoring bids
  // winnerScore = urgencyScore * 0.5 + (100 - distance) * 0.3 + surplusRatio * 0.2
  // We don't have accurate distance here without GMaps, we can mock distance or just use randomness for simulation purpose on server.
  // Actually, distance can be mocked based on coordinates.
  
  const getDistanceMock = () => Math.random() * 20; // Mock distance 0-20km

  let winner = null;
  let highestScore = -Infinity;

  const losers: string[] = [];

  for (const bid of auction.bids) {
    const mockDistance = getDistanceMock();
    const surplusRatio = bid.unitsAvailable / auction.unitsNeeded; // simplistic
    // user requested score logic:
    const score = (bid.urgencyScore * 0.5) + ((100 - mockDistance) * 0.3) + (surplusRatio * 0.2);

    if (score > highestScore) {
      if (winner) losers.push(winner.storeId);
      highestScore = score;
      winner = bid;
    } else {
      losers.push(bid.storeId);
    }
  }

  onComplete({ 
    type: 'BID_RESULT', 
    winner: winner?.storeId, 
    loser: losers, 
    product: auction.product, 
    units: Math.min(winner?.unitsAvailable || 0, auction.unitsNeeded), 
    eta: Math.floor(Math.random() * 15) + 5 // mock 5-20 mins
  });
}
