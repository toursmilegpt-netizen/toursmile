import React, { useState, useEffect, useRef } from 'react';

/**
 * Premium City Dropdown Selector
 * Shows default cities immediately on click, with search functionality
 */
const CityDropdownSelector = ({
  value,
  onChange,
  onClose,
  label,
  defaultCities,
  searchFunction,
  autoFocusNext
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(true);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Show default cities on mount
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults(defaultCities || []);
    } else {
      // Perform search with the provided search function
      const results = searchFunction(searchQuery);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    }
  }, [searchQuery, defaultCities, searchFunction]);

  // Auto-focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCitySelect = (city) => {
    onChange(city);
    setShowDropdown(false);
    onClose();
    
    // Auto-focus next field if provided
    if (autoFocusNext) {
      setTimeout(() => autoFocusNext(), 200);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="city-dropdown-premium"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        zIndex: 1000,
        maxWidth: 'none',
        minWidth: '100%',
      }}
    >
      {/* Search Input */}
      <div style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${label.toLowerCase()}...`}
          className="input-field-premium"
          style={{
            width: '100%',
            height: '42px',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px'
          }}
        />
      </div>

      {/* City List */}
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {searchResults.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: '14px'
            }}
          >
            No cities found
          </div>
        ) : (
          searchResults.map((city, index) => (
            <div
              key={`${city.iata}-${index}`}
              className="city-dropdown-item"
              onClick={() => handleCitySelect(city)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderBottom: index < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF8F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '32px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  marginRight: '12px',
                  flexShrink: 0
                }}
              >
                 <span style={{
                   fontSize: '12px',
                   fontWeight: '600',
                   color: '#374151',
                   fontFamily: 'sans-serif'
                 }}>
                   {city.iata}
                 </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {city.city}, {city.country} - {city.airport}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CityDropdownSelector;
