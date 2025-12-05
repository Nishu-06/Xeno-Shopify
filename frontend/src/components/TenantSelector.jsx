import React from 'react';

export default function TenantSelector({ tenants, selectedTenant, onSelect }) {
  const selectedTenantData = tenants.find((t) => t.id === selectedTenant);

  return (
    <div className="relative">
      <select
        value={selectedTenant || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition-all text-gray-900 dark:text-gray-100"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.shopDomain})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {selectedTenantData && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-md inline-block">
          <span className="text-purple-600 dark:text-purple-400 font-semibold">{selectedTenantData._count?.customers || 0}</span> customers •{' '}
          <span className="text-amber-600 dark:text-amber-400 font-semibold">{selectedTenantData._count?.orders || 0}</span> orders •{' '}
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedTenantData._count?.products || 0}</span> products
        </div>
      )}
    </div>
  );
}

