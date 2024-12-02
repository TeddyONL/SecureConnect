import { useState } from 'react';
import { useBusinessStore } from '../../stores/businessStore';
import { Business } from '../../types';
import { 
  CheckCircle, 
  AlertTriangle, 
  MoreVertical,
  Search,
  Filter,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminBusinessList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const { businesses, verifyBusiness, removeBusiness } = useBusinessStore();

  const handleVerify = async (businessId: string) => {
    try {
      await verifyBusiness(businessId, {
        type: 'official',
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      toast.success('Business verified successfully');
    } catch (error) {
      toast.error('Failed to verify business');
    }
  };

  const handleDelete = async (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await removeBusiness(businessId);
        toast.success('Business deleted successfully');
      } catch (error) {
        toast.error('Failed to delete business');
      }
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = filterVerified === null || business.isVerified === filterVerified;
    return matchesSearch && matchesVerified;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterVerified === null ? 'all' : filterVerified.toString()}
            onChange={(e) => setFilterVerified(e.target.value === 'all' ? null : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Business List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBusinesses.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {business.imageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={business.imageUrl}
                          alt={business.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {business.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {business.contact.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {business.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {business.location.city}, {business.location.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {business.isVerified ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {!business.isVerified && (
                      <button
                        onClick={() => handleVerify(business.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}