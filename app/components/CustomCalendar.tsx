import React, { useState, useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';
import Calendar from 'react-calendar';
import './calendar.css';

interface Schedule {
  date: Date;
  status: string | null;
}

interface CustomCalendarProps {
  setArrFunc: Dispatch<{ date: Date }[]>;
  schedules: Schedule[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ setArrFunc, schedules }) => {
  const [selectedDates, setSelectedDates] = useState<{ date: Date }[]>([]);

  const handleDateChange = (date: Date) => {
    const dateIndex = selectedDates.findIndex(selectedDate => selectedDate.date.toDateString() === date.toDateString());
  
    if (dateIndex !== -1) {
      setSelectedDates(selectedDates.filter((_, index) => index !== dateIndex));
    } else {
      setSelectedDates([...selectedDates, { date: date }]);
    }
  };

  useEffect(() => {
    setArrFunc(selectedDates);
  }, [selectedDates, setArrFunc]);

  const isDateAvailable = (date: Date) => {
    for(const schedule of schedules){
        if (new Date(schedule.date).toDateString() === date.toDateString())
        {
          if(schedule.status === "Available")
          {
            return false
          }
        }  
    }

    return true
  };
  return (
    <div className='app'>
      <span className="text-cusBlue text-3xl font-bold">Select Date</span>
      <div className='calendar-container'>
        <Calendar
          minDate={new Date()}
          onClickDay={handleDateChange}
          tileDisabled={({ date, view }) => view === 'month' && isDateAvailable(date)}
          tileClassName={({ date, view }) => {
            const isSelected = selectedDates.some(selectedDate => selectedDate.date.toDateString() === date.toDateString());
            return isSelected && view === 'month' ? 'highlight' : null;
          }}
        />
      </div>
    </div>
  );
}

export default CustomCalendar;