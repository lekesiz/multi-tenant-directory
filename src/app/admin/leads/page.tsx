'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  postalCode: string;
  phone: string;
  email?: string;
  note?: string;
  budgetBand?: string;
  timeWindow?: string;
  status: string;
  createdAt: string;
  category?: {
    frenchName: string;
  };
  assignments: Array<{
    id: string;
    score: number;
    rank: number;
    status: string;
    offeredAt: string;
    responseTime?: number;
    company: {
      id: number;
      name: string;
      phone?: string;
      email?: string;
    };
  }>;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'assigned' | 'won' | 'lost'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/leads?status=${filter === 'all' ? 'new' : filter}`);
      const data = await response.json();
      
      if (response.ok) {
        setLeads(data.leads || []);
      } else {
        toast.error('Erreur lors du chargement des leads');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Statut mis à jour');
        fetchLeads();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const triggerAIMatching = async (leadId: string) => {
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      });

      const result = await response.json();

      if (response.ok) {
        // Dispatch matches to companies
        const dispatchResponse = await fetch('/api/assignments/dispatch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId,
            matches: result.matches
          }),
        });

        if (dispatchResponse.ok) {
          toast.success('Lead distribué aux entreprises');
          fetchLeads();
        } else {
          toast.error('Erreur lors de la distribution');
        }
      } else {
        toast.error(result.error || 'Erreur lors du matching');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'spam': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'assigned': return 'Assigné';
      case 'won': return 'Gagné';
      case 'lost': return 'Perdu';
      case 'spam': return 'Spam';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Leads</h1>
          <p className="text-gray-600 mt-2">
            Gérez les demandes de devis et leur distribution aux entreprises
          </p>
        </div>
        <div className="flex space-x-2">
          {(['all', 'new', 'assigned', 'won', 'lost'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Tous' : 
               status === 'new' ? 'Nouveaux' :
               status === 'assigned' ? 'Assignés' :
               status === 'won' ? 'Gagnés' : 'Perdus'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">
            {leads.filter(l => l.status === 'new').length}
          </div>
          <div className="text-sm text-gray-600">Nouveaux</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {leads.filter(l => l.status === 'assigned').length}
          </div>
          <div className="text-sm text-gray-600">Assignés</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'won').length}
          </div>
          <div className="text-sm text-gray-600">Gagnés</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">
            {leads.filter(l => l.status === 'lost').length}
          </div>
          <div className="text-sm text-gray-600">Perdus</div>
        </div>
      </div>

      {/* Leads List */}
      {leads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun lead trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.category?.frenchName || 'Service général'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.postalCode}
                        </div>
                        {lead.budgetBand && (
                          <div className="text-xs text-gray-400">
                            Budget: {lead.budgetBand === 'low' ? '< 500€' :
                                     lead.budgetBand === 'medium' ? '500€ - 2000€' :
                                     lead.budgetBand === 'high' ? '> 2000€' : 'Personnalisé'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.phone}</div>
                      {lead.email && (
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {getStatusText(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.assignments.length > 0 ? (
                        <div>
                          <div className="font-medium">{lead.assignments.length} entreprise(s)</div>
                          <div className="text-xs text-gray-500">
                            {lead.assignments.filter(a => a.status === 'accepted').length} accepté(s)
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir
                      </button>
                      {lead.status === 'new' && (
                        <button
                          onClick={() => triggerAIMatching(lead.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Distribuer
                        </button>
                      )}
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="new">Nouveau</option>
                        <option value="assigned">Assigné</option>
                        <option value="won">Gagné</option>
                        <option value="lost">Perdu</option>
                        <option value="spam">Spam</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails du Lead
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Service</h4>
                  <p className="text-gray-600">{selectedLead.category?.frenchName || 'Service général'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Contact</h4>
                  <p className="text-gray-600">{selectedLead.phone}</p>
                  {selectedLead.email && <p className="text-gray-600">{selectedLead.email}</p>}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Localisation</h4>
                  <p className="text-gray-600">{selectedLead.postalCode}</p>
                </div>
                
                {selectedLead.note && (
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-600">{selectedLead.note}</p>
                  </div>
                )}
                
                {selectedLead.assignments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">Assignations</h4>
                    <div className="space-y-2">
                      {selectedLead.assignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{assignment.company.name}</p>
                              <p className="text-sm text-gray-600">Score: {assignment.score}/100</p>
                              <p className="text-sm text-gray-600">Rang: {assignment.rank}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              assignment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              assignment.status === 'declined' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignment.status === 'accepted' ? 'Accepté' :
                               assignment.status === 'declined' ? 'Refusé' : 'En attente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
