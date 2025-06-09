import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Check, X, AlertCircle, DollarSign, EyeOff, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointmentStore } from '../store/appointmentStore';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentForm from '../components/AppointmentForm';
import { format } from 'date-fns';

const Appointments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { appointments, loading, fetchAppointments, proposePrice, respondToPrice, rejectAppointment, cancelAppointment, hideAppointment } = useAppointmentStore();
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [price, setPrice] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [showHideConfirm, setShowHideConfirm] = useState<string | null>(null);

  const artistId = searchParams.get('artist');

  useEffect(() => {
    if (!userData) return;
    const cleanup = fetchAppointments(userData.uid, userData.role);
    return () => cleanup();
  }, [userData, fetchAppointments]);

  const handlePriceProposal = async (appointmentId: string) => {
    try {
      if (!price) {
        setPriceError('Please enter a price');
        return;
      }

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setPriceError('Please enter a valid price');
        return;
      }

      await proposePrice(appointmentId, priceValue);
      setSelectedAppointment(null);
      setPrice('');
      setPriceError('');
    } catch (error) {
      console.error('Error proposing price:', error);
    }
  };

  const handlePriceResponse = async (appointmentId: string, accepted: boolean) => {
    try {
      await respondToPrice(appointmentId, accepted);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error responding to price:', error);
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await rejectAppointment(appointmentId);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      setShowCancelConfirm(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleHide = async (appointmentId: string) => {
    if (!userData) return;
    try {
      await hideAppointment(appointmentId, userData.uid);
      setShowHideConfirm(null);
    } catch (error) {
      console.error('Error hiding appointment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
      case 'cancelled_by_client':
        return 'bg-red-100 text-red-800';
      case 'price_proposed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'price_proposed':
        return 'Price Proposed';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'cancelled_by_client':
        return 'Cancelled by Client';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {userData.role === 'client' ? 'Your Appointments' : 'Appointment Management'}
        </h1>
      </div>

      {userData.role === 'artist' && (
        <AppointmentCalendar
          appointments={appointments.map(apt => ({
            id: apt.id,
            clientName: apt.client?.fullName || 'Unknown Client',
            date: apt.date,
            time: apt.time,
            status: apt.status,
            description: apt.description
          }))}
          onDateSelect={(date) => console.log('Selected date:', date)}
        />
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {userData.role === 'client'
                ? "You haven't booked any appointments yet"
                : "You don't have any appointment requests"}
            </h2>
            <p className="text-gray-500">
              {userData.role === 'client'
                ? "Start by browsing artists and requesting an appointment"
                : "When clients request appointments, they'll appear here"}
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold text-lg">
                        {userData.role === 'client' 
                          ? appointment.artist?.fullName 
                          : appointment.client?.fullName}
                      </div>
                      {appointment.artist && (
                        <div className="text-gray-600">{appointment.artist.studioName}</div>
                      )}
                      {appointment.client && (
                        <>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {appointment.contactEmail}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {appointment.contactPhone}
                          </div>
                        </>
                      )}
                    </div>
                    {appointment.price && (
                      <div className="inline-block mt-2">
                        <span className="text-2xl font-bold text-indigo-600 bg-indigo-50 rounded-lg px-3 py-1.5 flex items-center">
                          <DollarSign className="h-6 w-6 mr-1" />
                          {appointment.price}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2" />
                        {format(new Date(appointment.date), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2" />
                        {appointment.time}
                      </div>
                    </div>
                    {appointment.artist && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        {appointment.artist.city}
                      </div>
                    )}
                    <div className="text-gray-600 mt-4">
                      {appointment.description}
                    </div>
                    {appointment.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={appointment.imageUrl}
                          alt="Reference"
                          className="max-h-48 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start md:items-end space-y-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(appointment.status)}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>

                    {/* Hide button for cancelled appointments */}
                    {['cancelled', 'cancelled_by_client', 'rejected'].includes(appointment.status) && (
                      <button
                        onClick={() => setShowHideConfirm(appointment.id)}
                        className="flex items-center text-gray-500 hover:text-gray-700"
                      >
                        <EyeOff className="h-5 w-5 mr-1" />
                        <span>Hide</span>
                      </button>
                    )}

                    {/* Artist Actions */}
                    {userData.role === 'artist' && appointment.status === 'pending' && (
                      <div className="mt-4 space-y-4">
                        {selectedAppointment === appointment.id ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($)
                              </label>
                              <input
                                type="number"
                                value={price}
                                onChange={(e) => {
                                  setPrice(e.target.value);
                                  setPriceError('');
                                }}
                                className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter price"
                                min="0"
                                step="0.01"
                              />
                              {priceError && (
                                <p className="text-red-600 text-sm mt-1">{priceError}</p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handlePriceProposal(appointment.id)}
                                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                              >
                                Propose Price
                              </button>
                              <button
                                onClick={() => handleReject(appointment.id)}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(null);
                                  setPrice('');
                                  setPriceError('');
                                }}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAppointment(appointment.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    )}

                    {/* Client Actions */}
                    {userData.role === 'client' && (
                      <div className="mt-4 space-y-2">
                        {appointment.status === 'price_proposed' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handlePriceResponse(appointment.id, true)}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept Price
                            </button>
                            <button
                              onClick={() => handlePriceResponse(appointment.id, false)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline Price
                            </button>
                          </div>
                        )}
                        {!['cancelled', 'cancelled_by_client', 'rejected'].includes(appointment.status) && (
                          <button
                            onClick={() => setShowCancelConfirm(appointment.id)}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                          >
                            Cancel Appointment
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                No, Keep It
              </button>
              <button
                onClick={() => handleCancel(showCancelConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Confirmation Modal */}
      {showHideConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Hide Appointment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to hide this appointment? You won't see it in your list anymore.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowHideConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                No, Keep It
              </button>
              <button
                onClick={() => handleHide(showHideConfirm)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Yes, Hide It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;