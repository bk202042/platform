import { Metadata } from 'next';
import AgentRegistrationForm from './_components/AgentRegistrationForm';

export const metadata: Metadata = {
  title: 'Join as an Agent | VinaHome',
  description: 'Unlock your agency&apos;s full potential with VinaHome. Boost listings, generate leads, and close deals faster with our AI-powered platform.',
};

export default function JoinAsAgentPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          Unlock Your Agency&apos;s Full Potential with VinaHome!
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Are you a real estate agency ready to <span className="font-bold">boost your listings, generate more leads, and close deals faster</span>?
        </p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Discover the all-in-one platform designed to <span className="font-bold">streamline operations, supercharge marketing, and grow your business effortlessly</span> with cutting-edge AI technology.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-12">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Why Choose VinaHome?</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">AI-powered property matching</span> that connects the right buyers to your listings</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">Advanced CRM & lead management</span> system that prioritizes high-potential clients</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">Automated marketing campaigns</span> tailored to your specific property portfolio</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">Professional photography services</span> included at no extra cost (3 properties monthly)</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">AI-driven market analysis</span> to optimize pricing strategies</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">Seamless transaction tracking</span> with paperless documentation</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">✓</span>
              <span><span className="font-semibold">Zero platform fees for 6 months</span> for early adopters</span>
            </li>
          </ul>
          <p className="mt-6 text-gray-600 italic">
            Join forward-thinking agencies who are already transforming their business with VinaHome&apos;s innovative tools.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">First 100 agencies receive:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-gray-900">Premium tablet PC</h3>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-gray-900">Custom agency profile development</h3>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-gray-900">3 free AI marketing consultation sessions</h3>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-gray-900">Complete digital infrastructure setup</h3>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ready to elevate your agency?</h2>
        <AgentRegistrationForm />
        <p className="mt-6 text-base text-gray-500 text-center">
          👉 Visit <a href="https://www.vinahome.cc" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.vinahome.cc</a> or email <a href="mailto:hello@vinahome.cc" className="text-blue-600 hover:underline">hello@vinahome.cc</a>
        </p>
      </div>

      <div className="text-center border-t border-gray-200 pt-8">
        <p className="text-lg font-semibold text-blue-600">
          VinaHome - Your AI-Powered Partner in Real Estate Success
        </p>
      </div>
    </div>
  );
}