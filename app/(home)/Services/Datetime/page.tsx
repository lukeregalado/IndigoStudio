'use client'
import Link from 'next/link'
import React, { useState, useEffect } from 'react';
import Calendar from '@/app/components/CustomCalendar';
import DropdownWrapper from '@/app/components/Dropdown/DropdownWrapper';
import { fetchSchedules } from '@/utils/supabase/data'

const Page = ({ searchParams }: {
  searchParams: {
    serviceid: string
  }
}) => {
  const [schedules, setSchedules] = useState<[]>([]);
  const [selectedSchedules, setselectedSchedules] = useState<[]>([]);
  const [ablebutton, setAbleButton] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const getSchedule = async () => {
    try {
      const fetchedSchedules = await fetchSchedules();
      
      const newSelectedDates = fetchedSchedules.map((schedule: { scheduleid: any; date: any; starttime: any; endtime: any; status: any }) => ({
        scheduleid: schedule.scheduleid,
        date: schedule.date,
        starttime: schedule.starttime,
        endtime: schedule.endtime,
        status: schedule.status
      }));
      setSchedules(newSelectedDates);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSchedule();
    if (selectedSchedules.length !== 0)
    {
      setAbleButton(false);
    }
    else{
      setAbleButton(true);
    }
    


  }, [selectedSchedules]);

  

  return (
    <>
      <div className='px-32 flex flex-col gap-8 mb-6 mt-20'>
        <div>
          <div className='text-cusBlue text-6xl font-bold'>
            Book an Appointment
            <div>
            </div>
          </div>
          <div>
            Services &gt; <span className='text-cusBlue'>Date & Time </span> &gt; Details &gt; Confirmation &gt; Booking Status
          </div>
        </div>

        <div>
          <div>
          </div>
          <div className='flex flex-row'>
            <div className='flex flex-col mr-4'>
              <Calendar setArrFunc={setselectedSchedules} schedules={schedules} />

              <Link href={
                {
                  pathname: "/Services/Datetime/Details",
                  query: {
                    schedules: JSON.stringify(selectedSchedules),
                    serviceid: searchParams.serviceid
                  }
                }
              }>
                <button disabled={ablebutton}className="bg-cusBlue rounded-3xl w-56 h-11 mt-8 px-0 text-white font-bold">
                  Proceed to Details
                </button>
              </Link>
            </div>
            
            <div className='flex flex-col'>
              <DropdownWrapper items={[]} setArrFunc={setselectedSchedules} selectedDates={selectedSchedules} setSelectedDates={setselectedSchedules} schedules={schedules} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page