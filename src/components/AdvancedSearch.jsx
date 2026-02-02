import { useState } from 'react';
import { Search, Filter, X, Calendar, Tag, Clock } from 'lucide-react';

export default function AdvancedSearch({ onSearch, availableTags = [] }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    dateRange: '',
    startDate: '',
    endDate: '',
    minDuration: '',
    hasActions: false,
    hasDecisions: false,
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      tags: [],
      dateRange: '',
      startDate: '',
      endDate: '',
      minDuration: '',
      hasActions: false,
      hasDecisions: false,
    });
    setQuery('');
    onSearch('', {});
  };

  const activeFiltersCount = 
    filters.tags.length +
    (filters.dateRange ? 1 : 0) +
    (filters.minDuration ? 1 : 0) +
    (filters.hasActions ? 1 : 0) +
    (filters.hasDecisions ? 1 : 0);

  return (
    <div className="advanced-search">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="input search-input"
            placeholder="Search sessions, transcripts, summaries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <button
              className="btn btn-ghost btn-sm clear-search"
              onClick={() => setQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="badge badge-primary">{activeFiltersCount}</span>
          )}
        </button>

        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel card">
          <div className="card-body">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">
                  <Calendar size={16} />
                  Date Range
                </label>
                <select
                  className="select"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="custom">Custom range</option>
                </select>

                {filters.dateRange === 'custom' && (
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      className="input"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      className="input"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <Clock size={16} />
                  Minimum Duration (minutes)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 30"
                  value={filters.minDuration}
                  onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <Tag size={16} />
                  Tags
                </label>
                <div className="tags-filter">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className={`badge badge-neutral tag-filter ${
                        filters.tags.includes(tag) ? 'selected' : ''
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {filters.tags.includes(tag) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Content</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasActions}
                      onChange={(e) => handleFilterChange('hasActions', e.target.checked)}
                    />
                    Has action items
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasDecisions}
                      onChange={(e) => handleFilterChange('hasDecisions', e.target.checked)}
                    />
                    Has decisions
                  </label>
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="filter-actions">
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .advanced-search {
          width: 100%;
          margin-bottom: var(--space-6);
        }

        .search-bar {
          display: flex;
          gap: var(--space-3);
          align-items: center;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: var(--space-3);
          color: var(--color-text-tertiary);
        }

        .search-input {
          padding-left: var(--space-10);
          padding-right: var(--space-10);
        }

        .clear-search {
          position: absolute;
          right: var(--space-2);
        }

        .filters-panel {
          margin-top: var(--space-4);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-6);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
        }

        .date-range-inputs {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .tags-filter {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .tag-filter {
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tag-filter:hover {
          background-color: var(--color-bg-hover);
        }

        .tag-filter.selected {
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
        }

        .checkbox-label input {
          cursor: pointer;
        }

        .filter-actions {
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-light);
          display: flex;
          justify-content: flex-end;
        }

        .btn.active {
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
