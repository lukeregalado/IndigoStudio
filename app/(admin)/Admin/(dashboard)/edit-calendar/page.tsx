'use client'
import Link from 'next/link'
import React, { useState } from 'react';
import { useEffect } from 'react';
import { checkCookie } from '@/app/lib/actions';
import Calendar from '@/app/components/EditCalendar';
import { fetchSchedules } from '@/utils/supabase/data';

const Page = ({ searchParams }: { searchParams: { id: string } }) => {
    const [selectedDates, setSelectedDates] = useState<{ date: Date }[]>([]);
    const [schedules, setSchedules] = useState<[]>([]);
    
    const datesString = JSON.stringify(selectedDates.map(obj => ({
        date: formatDateToLocal(obj.date)
    })));

    useEffect(() => {
        async function checkAuth() {
            const authenticated = await checkCookie();

            if(!authenticated){
                window.location.href = '/';
            }

        }

        checkAuth();
    }, [])

    function checker(dates: Date) {
        console.log(dates);
    }

    const handleClick = () => {
        selectedDates.forEach(obj => {
            checker(obj.date); // accessing the 'date' property of each object
        });
    }

    // this func fixes the offset of one day for selected dates
    function formatDateToLocal(date: Date) {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0]; 
    }

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
        }
    };

    useEffect(() => {
        getSchedule();
    }, []);

    return (
        <>
            {/* <ul>
                {selectedDates.map((obj, index) => (
                    <li key={index}>
                        {obj.date.toDateString()}
                    </li>
                ))}
            </ul> */}
            {/* above COMMENTED code displays currently selected dates */}
            <div className='px-32 flex flex-col gap-8 mb-6 mt-20'>
                <div>
                    <div className='text-4xl font-bold text-black'>
                        Edit Calendar
                    </div>
                    <div>
                        Select Dates &gt; <span className='text-cusBlue'> Select Timeslots </span>
                    </div>
                </div>
                <div>
                    <div className='flex flex-row'>
                        <div className='flex flex-col mr-32'>
                            <Calendar setArrFunc={setSelectedDates} schedules={schedules} />

                            <Link href={{
                                pathname: "./edit-calendar/time-slots",
                                query: {
                                    dates: datesString,
                                    serviceid: searchParams.id
                                }
                            }}>
                                <button 
                                    className="bg-cusBlue rounded-3xl w-56 h-11 mt-8 px-0 text-white font-bold"
                                    onClick={handleClick}
                                >
                                    Proceed
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page;
