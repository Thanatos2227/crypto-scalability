// Mock data and data management
class DataManager {
    constructor() {
        this.liveData = {
            timestamp: Date.now(),
            ethereum: {
                tps: 15,
                gasPrice: 25,
                blockTime: 12,
                networkLoad: 75
            },
            layer2: {
                arbitrum: { tps: 4000, cost: 0.5, load: 45 },
                optimism: { tps: 3500, cost: 0.8, load: 60 },
                polygon: { tps: 7000, cost: 0.01, load: 35 }
            },
            marketData: {
                ethPrice: 2400,
                totalValueLocked: 45000000000,
                dailyTransactions: 1200000
            }
        };
        
        this.updateInterval = null;
        this.callbacks = [];
    }

    // Start live data updates
    startLiveUpdates() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.updateLiveData();
            this.notifyCallbacks();
        }, 3000);
    }

    // Stop live data updates
    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Update live data with realistic fluctuations
    updateLiveData() {
        const data = this.liveData;
        
        // Update Ethereum data
        data.ethereum.tps = Math.max(10, Math.min(20, 
            data.ethereum.tps + (Math.random() - 0.5) * 2));
        data.ethereum.gasPrice = Math.max(15, Math.min(100, 
            data.ethereum.gasPrice + (Math.random() - 0.5) * 5));
        data.ethereum.blockTime = Math.max(10, Math.min(15, 
            data.ethereum.blockTime + (Math.random() - 0.5) * 0.5));
        data.ethereum.networkLoad = Math.max(30, Math.min(95, 
            data.ethereum.networkLoad + (Math.random() - 0.5) * 10));

        // Update Layer 2 data
        Object.keys(data.layer2).forEach(network => {
            const l2 = data.layer2[network];
            l2.tps = Math.max(l2.tps * 0.7, Math.min(l2.tps * 1.3, 
                l2.tps + (Math.random() - 0.5) * (l2.tps * 0.1)));
            l2.cost = Math.max(l2.cost * 0.5, Math.min(l2.cost * 2, 
                l2.cost + (Math.random() - 0.5) * (l2.cost * 0.2)));
            l2.load = Math.max(15, Math.min(85, 
                l2.load + (Math.random() - 0.5) * 8));
        });

        // Update market data
        data.marketData.ethPrice = Math.max(1800, Math.min(3500, 
            data.marketData.ethPrice + (Math.random() - 0.5) * 50));
        data.marketData.totalValueLocked = Math.max(30000000000, Math.min(80000000000, 
            data.marketData.totalValueLocked + (Math.random() - 0.5) * 1000000000));
        data.marketData.dailyTransactions = Math.max(800000, Math.min(2000000, 
            data.marketData.dailyTransactions + (Math.random() - 0.5) * 50000));

        data.timestamp = Date.now();
    }

    // Subscribe to data updates
    subscribe(callback) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    // Notify all subscribers
    notifyCallbacks() {
        this.callbacks.forEach(callback => callback(this.liveData));
    }

    // Get current data
    getData() {
        return this.liveData;
    }

    // Format currency values
    formatCurrency(value) {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(1)}B`;
        }
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        }
        return `$${value.toLocaleString()}`;
    }

    // Format number values
    formatNumber(value) {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return Math.round(value).toLocaleString();
    }
}

// Scaling calculator logic
class ScalingCalculator {
    constructor() {
        this.solutions = {
            'Ethereum Mainnet': {
                maxTps: 15,
                costPerTx: 15,
                color: 'ethereum'
            },
            'State Channels': {
                maxTps: 1000,
                costPerTx: 0.01,
                color: 'channels'
            },
            'Optimistic Rollups': {
                maxTps: 4000,
                costPerTx: 0.5,
                color: 'optimistic'
            },
            'ZK-Rollups + Sharding': {
                maxTps: 9000,
                costPerTx: 0.1,
                color: 'zk'
            }
        };
    }

    calculate(transactionVolume, userCount) {
        const throughputNeeded = transactionVolume / (24 * 60 * 60); 
        
        let recommendedSolution = '';
        let solution = null;
        
        // Find the most suitable solution
        if (throughputNeeded <= 15) {
            recommendedSolution = 'Ethereum Mainnet';
        } else if (throughputNeeded <= 1000) {
            recommendedSolution = 'State Channels';
        } else if (throughputNeeded <= 4000) {
            recommendedSolution = 'Optimistic Rollups';
        } else {
            recommendedSolution = 'ZK-Rollups + Sharding';
        }
        
        solution = this.solutions[recommendedSolution];
        
        // Calculate costs and savings
        const ethereumBaseCost = transactionVolume * this.solutions['Ethereum Mainnet'].costPerTx;
        const solutionCost = transactionVolume * solution.costPerTx;
        const estimatedSavings = Math.max(0, ethereumBaseCost - solutionCost);
        
        return {
            transactionVolume,
            userCount,
            throughputNeeded,
            recommendedSolution,
            costPerTransaction: solution.costPerTx,
            totalCost: solutionCost,
            estimatedSavings,
            solutionColor: solution.color
        };
    }

    getRecommendationText(solution) {
        const texts = {
            'Ethereum Mainnet': 'Your transaction volume is low enough that Ethereum mainnet can handle the load efficiently. The higher cost per transaction is offset by the maximum security and decentralization.',
            'State Channels': 'Perfect for frequent interactions between a limited set of participants. State channels offer instant finality and minimal costs after the initial setup.',
            'Optimistic Rollups': 'Ideal for your throughput needs with full EVM compatibility. Optimistic rollups provide significant cost savings while maintaining strong security guarantees.',
            'ZK-Rollups + Sharding': 'Your high transaction volume requires the most advanced scaling solutions. ZK-rollups with sharding provide maximum throughput with cryptographic security.'
        };
        
        return texts[solution] || 'Recommended solution based on your requirements.';
    }
}

// Create global instances
window.dataManager = new DataManager();
window.scalingCalculator = new ScalingCalculator();