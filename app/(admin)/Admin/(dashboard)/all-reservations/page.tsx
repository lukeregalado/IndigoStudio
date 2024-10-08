'use client'
import React, { useState, useEffect } from 'react';
import { fetchAppointments, fetchServices } from '@/utils/supabase/data';
import { reservation } from '@/utils/supabase/interfaces';
import { checkCookie } from '@/app/lib/actions';
import resetIcon from '@/public/reset.png'; 
import '../scrollbarStyle.css';

const Page: React.FC = () => {
  const [reservations, setReservations] = useState<reservation[]>([]);
  const [services, setServices] = useState<{ title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function getReservations() {
      try {
        const authenticated = await checkCookie();
        console.log('Authentication status:', authenticated);

        if (!authenticated) {
          window.location.href = '/';
        } else {
          const data = await fetchAppointments();
          setReservations(data);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    }

    async function getServices() {
      try {
        const data = await fetchServices(); 

        // flatten
        const flattenedServices = data.map((service: any) => service.service);
        setServices(flattenedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }

    getReservations();
    getServices();
  }, []);

  const getCombinedAppointments = () => {
    const combined = reservations.reduce((acc, curr) => {
      const { appointmentid, starttime, endtime } = curr;

      if (!acc[appointmentid]) {
        acc[appointmentid] = { ...curr };
      } else {
        acc[appointmentid].starttime = acc[appointmentid].starttime < starttime ? acc[appointmentid].starttime : starttime;
        acc[appointmentid].endtime = acc[appointmentid].endtime > endtime ? acc[appointmentid].endtime : endtime;
      }

      return acc;
    }, {} as { [key: string]: reservation });

    const sortedAppointments = Object.values(combined).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateA.getTime() - dateB.getTime();
    });

    return sortedAppointments;
  };

  const combinedAppointments = getCombinedAppointments();

  const filteredReservations = combinedAppointments.filter((reservation) => {
    const matchesStatus = filter === 'All' || reservation.status === filter;
    const matchesService = serviceFilter === 'All' || reservation.title === serviceFilter;
    const matchesSearch = reservation.reservee.toLowerCase().includes(searchQuery.toLowerCase()) || reservation.appointmentid.toString().includes(searchQuery);
    return matchesStatus && matchesService && matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('All');
    setServiceFilter('All');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pb-32 h-screen">
        <p className="text-3xl font-bold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-24 pt-16 pb-2">
        <div className="flex mb-4 mb-10">
          <input
            type="text"
            placeholder="Search customer or appointment ID..."
            className="h-10 border border-cusBlue bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 w-72 pl-3"
            style={{ borderRadius: '15px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="h-10 border border-cusBlue bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 pl-3 ml-2"
            style={{ borderRadius: '15px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Accepted">Accepted</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            className="h-10 border border-cusBlue bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 pl-3 ml-2"
            style={{ borderRadius: '15px' }}
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="All">All Services</option>
            {services.map((service, index) => (
              <option key={index} value={service.title}>{service.title}</option>
            ))}
          </select>
          <button
            className="h-10 border border-cusBlue bg-cusBlue rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 pl-2 pr-2 ml-2 flex items-center justify-center"
            style={{ borderRadius: '15px' }}
            onClick={clearFilters}
          >
            <img src={resetIcon.src} alt="Reset Filters" className="h-6 w-6"/>
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto rounded-3xl custom-scrollbar drop-shadow-2xl">
          <table className="max-h-[70vh] overflow-y-auto min-w-full bg-white border border-transparent shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <thead>
              <tr className="bg-cusBlue text-white text-left">
                <th className="border border-transparent px-4 py-2">ID</th>
                <th className="border border-transparent px-4 py-2">Date</th>
                <th className="border border-transparent px-4 py-2">Time</th>
                <th className="border border-transparent px-4 py-2">Reservee</th>
                <th className="border border-transparent px-4 py-2">Service</th>
                <th className="border border-transparent px-4 py-2">Amount Due</th>
                <th className="border border-transparent px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-cusBlue font-medium">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation, index) => (
                  <tr
                    key={index}
                    className={`${reservation.status === 'Pending' ? 'bg-purple-100' : ''}`}
                  >
                    <td className="border border-transparent px-4 py-2">{reservation.appointmentid}</td>
                    <td className="border border-transparent px-4 py-2">{reservation.date}</td>
                    <td className="border border-transparent px-4 py-2">{reservation.starttime} - {reservation.endtime}</td>
                    <td className="border border-transparent px-4 py-2">{reservation.reservee}</td>
                    <td className="border border-transparent px-4 py-2">{reservation.title}</td>
                    <td className="border border-transparent px-4 py-2">
                      ₱{reservation.totalamountdue ? Number(reservation.totalamountdue).toFixed(2) : '0.00'}
                    </td>
                    <td className="border border-transparent px-4 py-2">{reservation.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border border-transparent px-4 py-2 text-center">No reservations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Page;
