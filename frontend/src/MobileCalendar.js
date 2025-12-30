import React, { useState, useEffect, useRef, useMemo } from 'react';
import './premium-sunset-styles.css';

const MobileCalendar = ({ 
  tripType, 
  departDate, 
  returnDate, 
  onSelect, 
  minDate = new Date(),
  onClose 
}) => {
  const [selecting, setSelecting] = useState('depart'); // 'depart' or 'return'
  const scrollRef = useRef(null);

  // Ensure minDate is a Date object and set to midnight
  const effectiveMinDate = new Date(minDate);
  effectiveMinDate.setHours(0, 0, 0, 0);

  // Parse initial dates
  const initialDepart = departDate ? new Date(departDate) : null;
  if (initialDepart) initialDepart.setHours(0, 0, 0, 0);
  
  const initialReturn = returnDate ? new Date(returnDate) : null;
  if (initialReturn) initialReturn.setHours(0, 0, 0, 0);

  // Generate 12 months
  const months = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setDate(1); // Start from 1st of current month
    
    for (let i = 0; i < 13; i++) {
      const d = new Date(today);
      d.setMonth(today.getMonth() + i);
      result.push(d);
    }
    return result;
  }, []);

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const isBefore = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getTime() < d2.getTime();
  };

  const handleDateClick = (date) => {
    // If disabled
    if (isBefore(date, effectiveMinDate)) return;

    if (tripType === 'OW' || tripType === 'MC') {
      // Single date selection
      onSelect({ depart: date, return: null });
      if (onClose) onClose();
    } else {
      // Round Trip Logic using 'selecting' state to enforce flow
      if (selecting === 'depart') {
        // Always set departure first, clear return
        onSelect({ depart: date, return: null });
        setSelecting('return');
      } else {
        // Picking return date
        if (isBefore(date, initialDepart)) {
          // If user picks a date before departure, treat it as a correction to departure
          onSelect({ depart: date, return: null });
          // Stay in return mode (waiting for return), or reset? 
          // Usually if I pick earlier, I still need a return.
          // Let's keep it simple: New Departure -> Wait for Return
          setSelecting('return');
        } else {
          // Valid return date
          onSelect({ depart: initialDepart, return: date });
          if (onClose) onClose();
        }
      }
    }
  };

  const renderDay = (day, monthDate) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const isDisabled = isBefore(date, effectiveMinDate);
    const isSelectedDepart = isSameDay(date, initialDepart);
    const isSelectedReturn = isSameDay(date, initialReturn);
    const isInRange = initialDepart && initialReturn && date > initialDepart && date < initialReturn;
    
    const isToday = isSameDay(date, new Date());

    return (
      <div 
        key={day} 
        className={`
          relative h-12 flex items-center justify-center text-sm font-medium cursor-pointer
          ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900'}
          ${isSelectedDepart ? 'bg-blue-600 text-white rounded-l-full z-10' : ''}
          ${isSelectedReturn ? 'bg-blue-600 text-white rounded-r-full z-10' : ''}
          ${isInRange ? 'bg-blue-50' : ''}
          ${isSelectedDepart && isSelectedReturn ? 'rounded-full' : ''}
          ${isSelectedDepart && !initialReturn && tripType === 'RT' ? 'rounded-full' : ''}
          ${(isSelectedDepart || isSelectedReturn) && tripType !== 'RT' ? 'rounded-full' : ''}
        `}
        onClick={() => handleDateClick(date)}
      >
        {day}
        {isToday && !isSelectedDepart && !isSelectedReturn && !isInRange && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
        )}
        {(isSelectedDepart || isSelectedReturn) && (
           <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-blue-600 bg-white px-1 rounded shadow-sm whitespace-nowrap z-20">
             {isSelectedDepart ? (tripType === 'RT' ? 'DEPART' : 'TRAVEL') : 'RETURN'}
           </div>
        )}
      </div>
    );
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(renderDay(i, monthDate));
    }

    return (
      <div key={`${month}-${year}`} className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 px-4 mb-4 sticky top-0 bg-white py-2 z-10 shadow-sm">
          {monthName}
        </h3>
        <div className="grid grid-cols-7 px-2">
           {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
             <div key={i} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-400">
               {d}
             </div>
           ))}
           {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto pb-24" ref={scrollRef}>
        {months.map(renderMonth)}
      </div>
      
      {/* Floating Footer for Round Trip Status */}
      {tripType === 'RT' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          {/* Visual Guidance Prompt */}
          <div className="text-center mb-3">
            <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-700 animate-pulse">
              {selecting === 'depart' ? 'Select Departure Date' : 'Now Select Return Date'}
            </span>
          </div>

          <div className="flex justify-between items-center">
             <div className={`flex flex-col p-2 rounded-lg transition-colors ${selecting === 'depart' ? 'bg-blue-50 border border-blue-200' : ''}`}>
               <span className="text-xs text-gray-500 uppercase font-semibold">Departure</span>
               <span className={`text-sm font-bold ${initialDepart ? 'text-blue-600' : 'text-gray-300'}`}>
                 {initialDepart ? initialDepart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Select'}
               </span>
             </div>
             
             <div className="text-gray-300">→</div>
             
             <div className={`flex flex-col p-2 rounded-lg text-right transition-colors ${selecting === 'return' ? 'bg-blue-50 border border-blue-200' : ''}`}>
               <span className="text-xs text-gray-500 uppercase font-semibold">Return</span>
               <span className={`text-sm font-bold ${initialReturn ? 'text-blue-600' : 'text-gray-300'}`}>
                 {initialReturn ? initialReturn.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Select'}
               </span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCalendar;
