import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center py-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl text-white">
        <h1 className="text-5xl font-bold mb-6">Transform Your Ideas into Ink</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Connect with talented tattoo artists, design your perfect tattoo, and book your appointment - all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <Link
            to="/gallery"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition"
          >
            Browse Designs
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <FeatureCard
          icon={<Users className="h-12 w-12 text-purple-600" />}
          title="Expert Artists"
          description="Connect with verified, talented tattoo artists who match your style and vision."
        />
        <FeatureCard
          icon={<Calendar className="h-12 w-12 text-purple-600" />}
          title="Easy Booking"
          description="Schedule appointments, manage your sessions, and keep track of your tattoo journey."
        />
      </section>

      <section className="bg-gray-100 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-8">Coming Soon: Virtual Try-On</h2>
        <div className="max-w-2xl mx-auto">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
            <p className="text-gray-600">Preview your tattoo in real-time using your webcam</p>
          </div>
          <p className="text-gray-600">
            Experience how your chosen tattoo design will look on your body before making it permanent.
          </p>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;