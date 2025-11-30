        {/* Date Selection Content - Mobile vs Desktop */}
        {isMobile ? (
          <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            <MobileCalendar
              tripType={trip}
              departDate={trip === 'MC' && activeMultiCitySegment.index !== null ? multiCitySegments[activeMultiCitySegment.index]?.date : depart}
              returnDate={ret}
              minDate={trip === 'MC' && activeMultiCitySegment.index !== null && activeMultiCitySegment.index > 0
                ? multiCitySegments[activeMultiCitySegment.index - 1]?.date
                : new Date()}
              onClose={() => setShowDateOverlay(false)}
              onSelect={(selection) => {
                const formatDate = (d) => {
                  if (!d) return null;
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };

                if (trip === 'MC') {
                  const dStr = formatDate(selection.depart);
                  const currentIndex = activeMultiCitySegment.index;
                  setMultiCitySegments(prevSegments => {
                    return prevSegments.map((segment, idx) => {
                      if (idx === currentIndex) {
                        return { ...segment, date: dStr };
                      }
                      return segment;
                    });
                  });
                  // MobileCalendar handles closing for single date
                } else {
                  const dStr = formatDate(selection.depart);
                  const rStr = formatDate(selection.return);
                  
                  if (dStr) {
                    setDepart(dStr);
                    markStepComplete(3);
                  }
                  
                  if (rStr) {
                    setRet(rStr);
                    markStepComplete(4);
                  } else if (trip === 'RT' && selection.depart && !selection.return) {
                    // Just picked depart, waiting for return - do nothing else
                  } else if (trip === 'RT' && !rStr) {
                    setRet(null);
                  }

                  // Auto-close logic handled by MobileCalendar or here
                  if (trip === 'OW' || (trip === 'RT' && dStr && rStr)) {
                     setShowDateOverlay(false);
                     setTimeout(() => setShowPassengerOverlay(true), 500);
                  }
                }
              }}
            />
          </div>
        ) : (
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* Departure Date Dropdown */}
            <DropdownDatePicker 
              label={trip === 'MC' ? 'Flight Date' : 'Departure Date'} 
              value={trip === 'MC' && activeMultiCitySegment.index !== null 
                ? multiCitySegments[activeMultiCitySegment.index]?.date 
                : depart}
              minDate={trip === 'MC' && activeMultiCitySegment.index !== null && activeMultiCitySegment.index > 0
                ? multiCitySegments[activeMultiCitySegment.index - 1]?.date
                : null}
              onChange={(date) => {
                // Just update the state, don't trigger handleDateSelect yet
                // handleDateSelect will be called when "Apply Dates" is clicked
                if (trip === 'MC') {
                  // For multi-city, just update the segment date temporarily
                  const currentIndex = activeMultiCitySegment.index;
                  setMultiCitySegments(prevSegments => {
                    return prevSegments.map((segment, idx) => {
                      if (idx === currentIndex) {
                        return { ...segment, date };
                      }
                      return segment;
                    });
                  });
                } else {
                  setDepart(date);
                  markStepComplete(3);
                }
                // Don't auto-close for better UX - user can see both dates
              }}
            />
            
            {/* Return Date Dropdown - Show for round trip */}
            {trip === 'RT' && (
              <div style={{ marginTop: '16px' }}>
                <DropdownDatePicker 
                  label="Return Date" 
                  value={ret} 
                  onChange={(date) => {
                    setRet(date);
                    markStepComplete(4);
                  }}
                  minDate={depart}
                />
              </div>
            )}
            
            {/* Apply Button */}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowDateOverlay(false);
                  
                  // For multi-city, check if THIS is Flight 1 (index 0) being completed
                  if (trip === 'MC' && activeMultiCitySegment.index === 0) {
                    const firstSegment = multiCitySegments[0];
                    if (firstSegment.from && firstSegment.to && firstSegment.date) {
                      setTimeout(() => setShowPassengerOverlay(true), 200);
                    }
                  } else if (trip !== 'MC') {
                    // For OW/RT, auto-guide to passengers if dates are selected
                    if (depart && (trip !== 'RT' || ret)) {
                      setTimeout(() => setShowPassengerOverlay(true), 200);
                    }
                  }
                  
                  setActiveMultiCitySegment({ index: null, field: null });
                }}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Dates
              </button>
            </div>
          </div>
        </div>
        )}