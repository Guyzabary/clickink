import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Upload } from 'lucide-react';
import { uploadAppointmentImage } from '../utils/storage';

const BODY_AREAS = [
  'Arm',
  'Forearm',
  'Upper Arm',
  'Shoulder',
  'Back',
  'Chest',
  'Stomach',
  'Leg',
  'Thigh',
  'Calf',
  'Ankle',
  'Foot',
  'Hand',
  'Wrist',
  'Neck',
  'Hip',
  'Ribs',
  'Other'
];

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface AppointmentFormProps {
  artistId: string;
  artistName: string;
  onSubmit: (formData: {
    date: string;
    time: string;
    description: string;
    bodyArea: string;
    imageUrl?: string | null;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  artistId,
  artistName,
  onSubmit,
  onCancel
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [bodyArea, setBodyArea] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Contact details
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const validateDateTime = (date: string, time: string): string | null => {
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);
    
    if (selectedDateTime < now) {
      return 'Please select a future date and time';
    }
    
    return null;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^\+?[\d\s-()]{10,}$/.test(phone);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImage(file);
      setError('');
      setUploadProgress(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!date || !time || !description || !bodyArea || !contactName || !contactPhone || !contactEmail) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email format
    if (!validateEmail(contactEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone format
    if (!validatePhone(contactPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate date and time
    const dateTimeError = validateDateTime(date, time);
    if (dateTimeError) {
      setError(dateTimeError);
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;

      if (image) {
        try {
          setUploadProgress('Processing image...');
          imageUrl = await uploadAppointmentImage(image);
          setUploadProgress(null);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      await onSubmit({
        date,
        time,
        description,
        bodyArea,
        imageUrl,
        contactName,
        contactPhone,
        contactEmail
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // Get current date and time for input min values
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-lg space-y-4">
        <h3 className="font-semibold text-purple-800">Contact Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your email address"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            required
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time *
        </label>
        <div className="relative">
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            required
          >
            <option value="">Select a time</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body Area *
        </label>
        <select
          value={bodyArea}
          onChange={(e) => setBodyArea(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          required
        >
          <option value="">Select body area</option>
          {BODY_AREAS.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          rows={4}
          placeholder="Describe what you'd like to get tattooed..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                <span>Upload a file</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        </div>
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Reference"
              className="max-h-48 rounded-lg mx-auto"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setImagePreview(null);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Remove image
            </button>
          </div>
        )}
        {uploadProgress && (
          <div className="mt-2 text-sm text-purple-600">{uploadProgress}</div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Request Appointment'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;