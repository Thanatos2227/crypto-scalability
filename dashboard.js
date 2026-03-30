class DashboardManager {
    constructor() {
        this.currentTab = 'live';
        this.elements = {};
        this.unsubscribeData = null;
        this.calculationResult = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements.ethPrice = document.getElementById('eth-price');
        this.elements.totalTvl = document.getElementById('total-tvl');
        this.elements.dailyTxns = document.getElementById('daily-txns');
        this.elements.blockTime = document.getElementById('block-time');
        

        this.elements.ethTps = document.getElementById('eth-tps');
        this.elements.ethGas = document.getElementById('eth-gas');
        this.elements.ethLoad = document.getElementById('eth-load');
        this.elements.ethTpsProgress = document.getElementById('eth-tps-progress');
        this.elements.ethGasProgress = document.getElementById('eth-gas-progress');
        this.elements.ethLoadProgress = document.getElementById('eth-load-progress');
        this.elements.ethStatus = document.getElementById('eth-status');
        
        this.elements.l2Networks = document.getElementById('l2-networks');
        

        this.elements.lastUpdate = document.getElementById('last-update');
        
        this.elements.volumeSlider = document.getElementById('volume-slider');
        this.elements.volumeDisplay = document.getElementById('volume-display');
        this.elements.usersSlider = document.getElementById('users-slider');
        this.elements.usersDisplay = document.getElementById('users-display');
        this.elements.calculateBtn = document.getElementById('calculate-btn');
        this.elements.calculationResult = document.getElementById('calculation-result');
    }

    setupEventListeners() {
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                this.elements.volumeDisplay.textContent = parseInt(e.target.value).toLocaleString();
            });
        }

        if (this.elements.usersSlider) {
            this.elements.usersSlider.addEventListener('input', (e) => {
                this.elements.usersDisplay.textContent = parseInt(e.target.value).toLocaleString();
            });
        }

        if (this.elements.calculateBtn) {
            this.elements.calculateBtn.addEventListener('click', () => {
                this.calculateScaling();
            });
        }
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.dashboard-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        this.currentTab = tabName;
    }


    start() {
        this.unsubscribeData = window.dataManager.subscribe((data) => {
            this.updateLiveMetrics(data);
        });
        
        window.dataManager.startLiveUpdates();
        
        this.updateLiveMetrics(window.dataManager.getData());
    }

    stop() {
        if (this.unsubscribeData) {
            this.unsubscribeData();
            this.unsubscribeData = null;
        }
        
        window.dataManager.stopLiveUpdates();
    }

    updateLiveMetrics(data) {
        if (this.elements.ethPrice) {
            this.elements.ethPrice.textContent = `$${Math.round(data.marketData.ethPrice).toLocaleString()}`;
        }
        
        if (this.elements.totalTvl) {
            this.elements.totalTvl.textContent = window.dataManager.formatCurrency(data.marketData.totalValueLocked);
        }
        
        if (this.elements.dailyTxns) {
            this.elements.dailyTxns.textContent = window.dataManager.formatNumber(data.marketData.dailyTransactions);
        }
        
        if (this.elements.blockTime) {
            this.elements.blockTime.textContent = `${data.ethereum.blockTime.toFixed(1)}s`;
        }

        if (this.elements.ethTps) {
            this.elements.ethTps.textContent = `${data.ethereum.tps.toFixed(1)} TPS`;
        }
        
        if (this.elements.ethGas) {
            this.elements.ethGas.textContent = `${Math.round(data.ethereum.gasPrice)} Gwei`;
        }
        
        if (this.elements.ethLoad) {
            this.elements.ethLoad.textContent = `${Math.round(data.ethereum.networkLoad)}%`;
        }

        if (this.elements.ethTpsProgress) {
            this.elements.ethTpsProgress.style.width = `${(data.ethereum.tps / 20) * 100}%`;
        }
        
        if (this.elements.ethGasProgress) {
            this.elements.ethGasProgress.style.width = `${(data.ethereum.gasPrice / 100) * 100}%`;
        }
        
        if (this.elements.ethLoadProgress) {
            this.elements.ethLoadProgress.style.width = `${data.ethereum.networkLoad}%`;
        }

        if (this.elements.ethStatus) {
            const isHigh = data.ethereum.networkLoad > 80;
            this.elements.ethStatus.className = `status-badge ${isHigh ? 'status-high' : 'status-normal'}`;
            this.elements.ethStatus.textContent = isHigh ? 'High Congestion' : 'Normal Operation';
        }

        this.updateL2Networks(data.layer2);

        if (this.elements.lastUpdate) {
            this.elements.lastUpdate.textContent = new Date(data.timestamp).toLocaleTimeString();
        }
    }

    updateL2Networks(l2Data) {
        if (!this.elements.l2Networks) return;
        
        const networksHtml = Object.entries(l2Data).map(([name, data]) => `
            <div class="l2-network">
                <div class="l2-header">
                    <span class="l2-name">${name}</span>
                    <span class="l2-tps">${Math.round(data.tps).toLocaleString()} TPS</span>
                </div>
                <div class="l2-stats">
                    <span>Cost:</span>
                    <span>$${data.cost.toFixed(3)}</span>
                    <span>Load:</span>
                    <span>${Math.round(data.load)}%</span>
                </div>
                <div class="l2-progress">
                    <div class="l2-progress-fill" style="width: ${data.load}%;"></div>
                </div>
            </div>
        `).join('');
        
        this.elements.l2Networks.innerHTML = networksHtml;
    }

    calculateScaling() {
        const volume = parseInt(this.elements.volumeSlider.value);
        const users = parseInt(this.elements.usersSlider.value);
        
        this.calculationResult = window.scalingCalculator.calculate(volume, users);
        this.displayCalculationResult();
    }

    displayCalculationResult() {
        if (!this.calculationResult || !this.elements.calculationResult) return;
        
        const result = this.calculationResult;
        const recommendationText = window.scalingCalculator.getRecommendationText(result.recommendedSolution);
        
        const resultHtml = `
            <div class="result-header">
                <div class="result-title">Recommended Solution</div>
                <div class="solution-badge solution-${result.solutionColor}">
                    ${result.recommendedSolution}
                </div>
            </div>
            
            <div class="result-metrics">
                <div class="result-metric">
                    <i class="fas fa-bolt text-yellow"></i>
                    <div class="result-metric-content">
                        <div class="result-metric-label">TPS Needed</div>
                        <div class="result-metric-value">${result.throughputNeeded.toFixed(1)}</div>
                    </div>
                </div>
                
                <div class="result-metric">
                    <i class="fas fa-dollar-sign text-green"></i>
                    <div class="result-metric-content">
                        <div class="result-metric-label">Cost per Tx</div>
                        <div class="result-metric-value">$${result.costPerTransaction.toFixed(3)}</div>
                    </div>
                </div>
                
                <div class="result-metric">
                    <i class="fas fa-calculator text-blue"></i>
                    <div class="result-metric-content">
                        <div class="result-metric-label">Total Daily Cost</div>
                        <div class="result-metric-value">$${Math.round(result.totalCost).toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="result-metric">
                    <i class="fas fa-shield-alt text-purple"></i>
                    <div class="result-metric-content">
                        <div class="result-metric-label">Est. Savings</div>
                        <div class="result-metric-value result-savings">$${Math.round(result.estimatedSavings).toLocaleString()}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 16px; padding: 12px; background: rgba(55, 65, 81, 0.2); border-radius: 6px;">
                <h4 style="color: #f1f5f9; font-size: 14px; margin-bottom: 8px;">
                    Why ${result.recommendedSolution}?
                </h4>
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.4;">
                    ${recommendationText}
                </p>
            </div>
        `;
        
        this.elements.calculationResult.innerHTML = resultHtml;
        this.elements.calculationResult.style.display = 'block';
    }
}

// Create global dashboard manager
window.dashboardManager = new DashboardManager();