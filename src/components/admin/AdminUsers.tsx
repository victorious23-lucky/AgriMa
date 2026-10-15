import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  CheckCircle2,
  Building,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface AdminUsersProps {
  initialRoleFilter?: 'all' | 'farmer' | 'buyer';
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ initialRoleFilter = 'all' }) => {
  const { users, verifyFarmer, suspendUser, activateUser, deleteUser } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>(initialRoleFilter);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.county || '').toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            User Accounts Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Oversee registered producers, commercial buyers, verification badges, and access authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
            {filteredUsers.length} Users Listed
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, phone or county..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-purple-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-purple-600 focus:bg-white font-medium"
            >
              <option value="all">All Roles (Farmers, Buyers, Admins)</option>
              <option value="farmer">Farmers Only</option>
              <option value="buyer">Buyers Only</option>
              <option value="admin">Administrators Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3">User Profile</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">County / Location</th>
                <th className="px-5 py-3">Affiliation / Holding</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-stone-400">
                    No registered user found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{u.name}</p>
                          <p className="text-[11px] text-stone-400">{u.email}</p>
                          <p className="text-[10px] text-stone-400">{u.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'farmer'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'buyer'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-stone-800">{u.county} County</p>
                      <span className="text-[10px] text-stone-400">{u.location}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      {u.role === 'farmer' ? (
                        <div>
                          <p className="font-medium text-stone-800">{u.farmName || 'Private Farm'}</p>
                          <span className="text-[10px] text-stone-400">{u.farmSize || 'N/A'}</span>
                        </div>
                      ) : u.role === 'buyer' ? (
                        <div>
                          <p className="font-medium text-stone-800">{u.businessName || 'Independent'}</p>
                          <span className="text-[10px] text-stone-400">{u.buyerType || 'Wholesale'}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400">Governance Portal</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => verifyFarmer(u.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 hover:bg-purple-100"
                        >
                          Verify Now
                        </button>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-stone-400 text-[11px]">{u.joinedDate}</td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {u.status === 'Active' ? (
                          <button
                            type="button"
                            onClick={() => suspendUser(u.id)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-50"
                            title="Suspend Account"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => activateUser(u.id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50"
                            title="Activate Account"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">{selectedUser.name}</h3>
                  <span className="text-[11px] font-bold text-emerald-700 capitalize">
                    {selectedUser.role} Account
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Email:</span>
                <span className="font-bold text-stone-900">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Phone:</span>
                <span className="font-bold text-stone-900">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">County:</span>
                <span className="font-bold text-stone-900">{selectedUser.county}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Location:</span>
                <span className="font-bold text-stone-900">{selectedUser.location}</span>
              </div>
              {selectedUser.role === 'farmer' && (
                <>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Farm Name:</span>
                    <span className="font-bold text-stone-900">{selectedUser.farmName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Farm Size:</span>
                    <span className="font-bold text-stone-900">{selectedUser.farmSize || 'N/A'}</span>
                  </div>
                </>
              )}
              {selectedUser.role === 'buyer' && (
                <>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Business:</span>
                    <span className="font-bold text-stone-900">{selectedUser.businessName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Buyer Type:</span>
                    <span className="font-bold text-stone-900">{selectedUser.buyerType || 'N/A'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Verification Status:</span>
                <span className="font-bold text-emerald-800">
                  {selectedUser.isVerified ? 'Verified Producer' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {!selectedUser.isVerified && (
                <button
                  type="button"
                  onClick={() => {
                    verifyFarmer(selectedUser.id);
                    setSelectedUser({ ...selectedUser, isVerified: true });
                  }}
                  className="flex-1 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800"
                >
                  Verify User
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2 text-xs font-semibold bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
