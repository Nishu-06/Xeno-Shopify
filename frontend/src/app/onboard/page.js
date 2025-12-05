'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tenantAPI } from '@/lib/api';

export default function Onboard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shopDomain: '',
    accessToken: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await tenantAPI.create(formData);
      if (response.data.tenant) {
        router.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to onboard store. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboard Shopify Store</h1>
          <p className="text-gray-600 mb-6">
            Connect your Shopify store to start ingesting data and viewing insights.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="My Shopify Store"
              />
            </div>

            <div>
              <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-1">
                Shop Domain
              </label>
              <input
                id="shopDomain"
                type="text"
                required
                value={formData.shopDomain}
                onChange={(e) => setFormData({ ...formData, shopDomain: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="myshop.myshopify.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your Shopify shop domain (e.g., myshop.myshopify.com)
              </p>
            </div>

            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-1">
                Shopify Admin API Access Token
              </label>
              <textarea
                id="accessToken"
                required
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="mt-1 text-xs text-gray-500">
                Create a private app in your Shopify admin and generate an admin API access token.
                Make sure to grant read permissions for Customers, Orders, and Products.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">How to get your access token:</h3>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to your Shopify Admin → Apps → Develop apps</li>
                <li>Create a new private app</li>
                <li>Enable Admin API access with read permissions for Customers, Orders, and Products</li>
                <li>Install the app and copy the Admin API access token</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Onboarding...' : 'Connect Store'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

