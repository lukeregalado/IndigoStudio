'use client'
import React, { useEffect, useState } from 'react'
import Link from "next/link";
import { fetchOneAdditionalServiceWithTitle, fetchOneMainServiceHourlyPrice, fetchOneMainServiceOnetime, fetchOneService, fetchSelectedSchedules } from '@/utils/supabase/data'
import Schedules from '@/app/components/Schedules';


const formatDate = (dateString:string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined);
};

const Page = ({ searchParams }: {
    searchParams: {
        schedules: string,

        service: string,
        serviceType:string,

        maincustomerfirstname: string,
        maincustomermiddlename: string,
        maincustomerlastname: string,

        phonenumber: string,
        emailaddress: string,
        countAdditionalCustomers: number,

        needsparking: string,
        additionalrequests: string,
        additionalCustomersfirstnames: string, // JSON
        additionalCustomersmiddlenames: string, // JSON
        additionalCustomerslastnames: string, // JSON
        hours:number,
        additionalpackage:string
    }
}) => {

    const [selectedService, setSelectedService] = useState<string>(" ");
    const [listofschedules, setlistofschedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);


    const [priceAdditionalService, setPriceAdditionalService] = useState(0);
    const [priceMainService, setPriceMainService] = useState(0);

    useEffect(() => {
        const theService = JSON.parse(searchParams.service);

        if(JSON.parse(searchParams.serviceType) === 'onetime'){
            const getPriceAdditional= async () =>{
                const onetimeprice = await fetchOneMainServiceOnetime(JSON.parse(theService.serviceid));
                setPriceMainService(onetimeprice[0].rate);
            }
            getPriceAdditional();
        }
        else{
            const getPriceAdditional= async () =>{
                const hourlyprice = await fetchOneMainServiceHourlyPrice(JSON.parse(theService.serviceid));
                
                setPriceMainService(hourlyprice[0].rate * (searchParams.hours/hourlyprice[0].hours));
            }
            getPriceAdditional();
        }

        const getPriceAdditional= async () => {
            try {
                const additionalserviceid = await fetchOneAdditionalServiceWithTitle(JSON.parse(searchParams.additionalpackage));
                if (!(additionalserviceid === 0))
                    setPriceAdditionalService(additionalserviceid[0].rate);

            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const getService = async () => {
            try {
                const selectedservice = await fetchOneService(parseInt(theService.serviceid));
                setSelectedService(selectedservice[0].title);

            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const selectedschedules = JSON.parse(searchParams.schedules);
        const getSelectedSchedules = async () => {

            const newSchedules: any[] = [];

            for (const selectedsched of selectedschedules) {

                try {
                    const getData = await fetchSelectedSchedules(selectedsched.date, selectedsched.selectedtime1, selectedsched.selectedtime2);
                    
                    getData.forEach((one: any) => {
                        setlistofschedules(listofschedules => [...listofschedules,one]);
                    });
                } catch (error) {
                    console.error('Error fetching services:', error);
                }finally{
                    setLoading(false);
                }
                
            };
            setLoading(false);
        }
        getService();
        getSelectedSchedules();
        getPriceAdditional();
        

    }, []);

    function parkingChecker(needsparking: string) {
        return needsparking === "true";
    }
    const listadditionalcustomersfirstnames = JSON.parse(searchParams.additionalCustomersfirstnames);
    const listadditionalcustomersmiddlenames = JSON.parse(searchParams.additionalCustomersmiddlenames);
    const listadditionalcustomerslastnames = JSON.parse(searchParams.additionalCustomerslastnames);
    
    const parseTimeString = (timeString: string): Date => {  // helper function
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds || 0);
        return date;
      };

    
    const formatTimeString = (timeString: string): string => {
        const date = parseTimeString(timeString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const isPM = hours >= 12;
        const adjustedHours = hours % 12 === 0 ? 12 : hours % 12; 
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const suffix = isPM ? 'PM' : 'AM';
        return `${adjustedHours}:${formattedMinutes} ${suffix}`; //end
      };

      console.log(searchParams.schedules)
    
    return (
        <>
            <div className='px-32 flex flex-col gap-8 mb-6 mt-20'>
                <div>
                    <div className='text-cusBlue text-6xl font-bold'>
                        Book an Appointment
                    </div>
                    <div>
                        Services &gt; Details &gt; ExtraDetails &gt; Date & Time &gt; <span className='text-cusBlue'>Confirmation</span> &gt; Booking Status
                    </div>
                </div>
                {loading ? (
                    <>
                        <div className='flex flex-col items-center'>
                            <span className="text-gray-500 font-medium italic text-3xl"> Loading... </span>
                        </div>
                    </>
                    ) : (
                <>
                <div className="flex flex-row">
                    <div className='flex flex-row'>
                        <div className='flex flex-col'>
                            <div className="flex flex-col border-2 border-indigo-800 rounded-lg p-4">
                                <span className='text-black font-bold mb-5 text-3xl drop-shadow-2xl'> Main Customer: </span>
                                <div className='flex flex-col p-0 ml-8 my-0 mr-0'>
                                    <span className='text-black font-semibold mb-5 text-xl mar '> Name: {searchParams.maincustomerfirstname} {searchParams.maincustomermiddlename} {searchParams.maincustomerlastname}</span>
                                    <span className='text-black font-semibold mb-5 text-xl'> Contact number: {searchParams.phonenumber}</span>
                                    <span className='text-black font-semibold mb-5 text-xl'> Email address: {searchParams.emailaddress}</span>
                                </div>
                            </div>

                            <div className='flex flex-col border-2 border-indigo-800 mt-5 rounded-lg p-4 drop-shadow-2xl'>
                                <span className='text-black font-bold text-3xl mr-16 my-6'> Additional Persons Involved: </span>
                                <div className='flex flex-col p-0 my-0 mr-0'>
                                    {listadditionalcustomersfirstnames.length === 0 ? (
                                        <span className='text-black text-xl font-semibold mb-5 ml-8 text-md'>None</span>
                                    ) : (
                                        listadditionalcustomersfirstnames.map((firstName: string, i: number) => (
                                            <span className='text-black text-xl font-semibold mb-5 ml-8 text-md' key={i}>
                                                Person {i + 1}. {firstName} {listadditionalcustomersmiddlenames[i]} {listadditionalcustomerslastnames[i]}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-col border-2 border-indigo-800 mt-5 rounded-lg p-4 pb-8'>
                                <span className='text-black font-bold text-3xl mr-16 my-6 mb-4 mt-0 drop-shadow-2xl'> Parking: </span>
                                <div className='ml-8 font-semibold text-black text-xl'> Parking Needed: {parkingChecker(searchParams.needsparking) ? "Yes" : "No"}</div>
                            </div>
                            <Link
                                href={{
                                    pathname: "/Services/Details/Extradetails/Datetime/Confirmation/Bookingstatus",
                                    query: {
                                        schedules: JSON.stringify(listofschedules),
                                        service: searchParams.service,
                                        serviceType:searchParams.serviceType,
                                        maincustomerfirstname: searchParams.maincustomerfirstname,
                                        maincustomermiddlename: searchParams.maincustomermiddlename,
                                        maincustomerlastname: searchParams.maincustomerlastname,
                                        phonenumber: searchParams.phonenumber,
                                        emailaddress: searchParams.emailaddress,
                                        countAdditionalCustomers: searchParams.countAdditionalCustomers,
                                        needsparking: searchParams.needsparking,
                                        additionalrequests: searchParams.additionalrequests,
                                        additionalCustomersfirstnames: searchParams.additionalCustomersfirstnames,
                                        additionalCustomersmiddlenames: searchParams.additionalCustomersmiddlenames,
                                        additionalCustomerslastnames: searchParams.additionalCustomerslastnames,
                                        hours: searchParams.hours, 
                                        additionalpackage: searchParams.additionalpackage,
                                        selectedServicetitle:selectedService,
                                        
                                        mainprice: priceMainService,
                                        additionalprice: priceAdditionalService
                                    }
                                }}>
                                <button
                                    className="bg-cusBlue rounded-3xl w-56 h-11 mt-8 px-0 text-white font-bold"> Confirm Details </button> </Link>

                        </div>
                        
                        
                        <div className='flex flex-col ml-20 border-2 border-indigo-800 rounded-lg p-4 h-fit pr-32'>
                            <span className='text-black font-bold mb-2 text-3xl'> Reservation Details: </span>
                            <span className='text-black mb-0 text-xl'> <span className='font-bold'> Package Selected: </span> {selectedService}  - <span className='italic'> ₱{priceMainService}</span></span>
                            
                            {JSON.parse(searchParams.additionalpackage).length === 0 ? (
                                <div>
                                    <span className='text-black mb-9 text-xl'> <span className='font-bold'> Additional Package Selected: </span> NONE SELECTED </span>
                                </div>
                            ):(<div> 
                                <span className='text-black mb-9 text-sm'> <span className='font-bold'> Additional Package Selected: </span> {JSON.parse(searchParams.additionalpackage)} - <span className='italic'>₱{priceAdditionalService} </span> </span>
                                </div>)}
                                <span className='text-black mb-7 text-lg'> <span className='font-bold'>  Total Amount Due: </span> ₱{priceMainService + priceAdditionalService} pesos </span>
                            

                            <span className='text-black font-bold mb-2 text-xl'> Appointment schedules: </span>
                            <div className='flex flex-col'>
                                <Schedules listofschedules={listofschedules}/>
                            </div>
                            <span className='text-black font-bold mb-5 text-xl'> Additional Requests:  </span>
                            <div className="flex flex-col">
                                <span className='text-black font-bold mb-5 text-md'> {searchParams.additionalrequests} </span>
                            </div>
                        </div>
                    </div>
                </div>
                </>
                )}
            </div>
        </>
    )
}

export default Page