
'use client'
import Link from 'next/link'

import Calendar from '@/app/components/CustomCalendar'; 
import Dropdown from '@/app/components/Dropdown/Dropdown';

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';


const page = () => {
    const time = [];
    const startTime = 9 * 60; // 0900am
    const endTime = 21 * 60 + 30; //0930pm
    
    for (let minutes = startTime; minutes <= endTime; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMins = mins === 0 ? '00' : mins;
      time.push(`${formattedHours}:${formattedMins}${period}`);
    }
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
            Package &gt; <span className='text-cusBlue'>Date & Time </span> &gt; Details &gt; Confirmation &gt; Booking Status
        </div>
    </div>

    <div>
        <div>

        </div>
        <div className='flex flex-row'>

            <div className='flex flex-col mr-32'>
                <Calendar />
                <Link href="/Services/Datetime/Details"> <button className="bg-cusBlue rounded-3xl w-56 h-11 mt-8 px-0 text-white font-bold"> Proceed to Details </button> </Link>
            </div>  

            
            <div className="flex flex-col">
                <span className="text-cusBlue text-3xl font-bold"> Select a time </span>
                <div className='flex flex-row'>
                    <div className='flex flex-col mr-20 '>
                        <span className='font-bold text-black'> Start </span>
                        <Dropdown items={time} />
                    </div>
                    <div className='flex flex-col mr-20 '>
                    <span className='font-bold text-black' > End </span>
                        <Dropdown items={time} />
                    </div>

                    </div>
                </div>
        </div>
    </div>
    
    </div>
    </>
  )
}

export default page