/**
 * Transactions Component
 * Transaction history with import/export functionality
 */

import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, Filter, Search } from 'lucide-react';
import { Transaction, Portfolio } from '../../../types/crypto';
import { portfolioService } from '../../../services/crypto/portfolioService';

const Transactions: React.FC<{ portfolioId?: string }> = ({ portfolioId }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell' | 'transfer' | 'swap'>('all');

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadTransactions();
    }
  }, [selectedPortfolio]);

  const loadPortfolios = () => {
    const allPortfolios = portfolioService.getPortfolios();
    setPortfolios(allPortfolios);
    if (portfolioId) {
      const portfolio = allPortfolios.find(p => p.id === portfolioId);
      if (portfolio) setSelectedPortfolio(portfolio);
    } else if (allPortfolios.length > 0) {
      setSelectedPortfolio(allPortfolios[0]);
    }
  };

  const loadTransactions = () => {
    if (!selectedPortfolio) return;
    const txs = portfolioService.getTransactions(selectedPortfolio.id);
    setTransactions(txs);
  };

  const handleDelete = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      portfolioService.deleteTransaction(transactionId);
      loadTransactions();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${selectedPortfolio?.name || 'portfolio'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPortfolio) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Transaction[];
        imported.forEach(tx => {
          portfolioService.addTransaction({
            ...tx,
            portfolioId: selectedPortfolio.id,
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          });
        });
        loadTransactions();
        alert(`Imported ${imported.length} transactions`);
      } catch (error) {
        alert('Failed to import transactions. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.symbol.toLowerCase().includes(query) ||
        tx.exchange?.toLowerCase().includes(query) ||
        tx.notes?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedPortfolio) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">Select a portfolio to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Transaction History</h2>
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="all">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
          <option value="transfer">Transfer</option>
          <option value="swap">Swap</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Exchange</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    {searchQuery || filterType !== 'all' 
                      ? 'No transactions match your filters' 
                      : 'No transactions yet'}
                  </td>
                </tr>
              ) : (
                filteredTransactions
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      onDelete={handleDelete}
                    />
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TransactionRow: React.FC<{
  transaction: Transaction;
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
  onDelete: (id: string) => void;
}> = ({ transaction, formatCurrency, formatDate, onDelete }) => {
  const typeColors = {
    buy: 'text-green-400 bg-green-600/20',
    sell: 'text-red-400 bg-red-600/20',
    transfer: 'text-blue-400 bg-blue-600/20',
    swap: 'text-purple-400 bg-purple-600/20',
  };

  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 text-gray-400 text-sm">
        {formatDate(transaction.timestamp)}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[transaction.type]}`}>
          {transaction.type.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-white">{transaction.symbol.toUpperCase()}</div>
      </td>
      <td className="px-4 py-3 text-right text-white">
        {transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </td>
      <td className="px-4 py-3 text-right text-gray-400">
        {formatCurrency(transaction.price)}
      </td>
      <td className="px-4 py-3 text-right text-white font-medium">
        {formatCurrency(transaction.total)}
      </td>
      <td className="px-4 py-3 text-gray-400 text-sm">
        {transaction.exchange || '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default Transactions;

