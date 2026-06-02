import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { useCreateVolumeContract } from '@/hooks/useVolumeContracts';

export default function ContractCreate() {
  const navigate = useNavigate();
  const createContract = useCreateVolumeContract();

  const [form, setForm] = useState({
    code: '',
    name: '',
    customerId: '',
    startDate: '',
    endDate: '',
    targetVolume: '',
    bonusType: 'PERCENTAGE',
    bonusValue: '',
    channel: '',
    region: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContract.mutateAsync({
        ...form,
        targetVolume: parseFloat(form.targetVolume),
        bonusValue: parseFloat(form.bonusValue || '0'),
      });
      navigate('/contracts');
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Volume Contract"
        description="Set up a new volume contract with a key account"
        breadcrumbs={[
          { label: 'Contracts', href: '/contracts' },
          { label: 'Create' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contract Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  placeholder="VC-BIGC-2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contract Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Big C Volume Contract 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer ID *</label>
                <input
                  type="text"
                  required
                  value={form.customerId}
                  onChange={(e) => updateField('customerId', e.target.value)}
                  placeholder="Customer ID"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume & Bonus */}
          <Card>
            <CardHeader>
              <CardTitle>Volume & Bonus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Volume (cases) *</label>
                <input
                  type="number"
                  required
                  value={form.targetVolume}
                  onChange={(e) => updateField('targetVolume', e.target.value)}
                  placeholder="120000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bonus Type</label>
                  <select
                    value={form.bonusType}
                    onChange={(e) => updateField('bonusType', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="TIERED">Tiered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bonus Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.bonusValue}
                    onChange={(e) => updateField('bonusValue', e.target.value)}
                    placeholder="3.5"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Channel</label>
                  <select
                    value={form.channel}
                    onChange={(e) => updateField('channel', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Channels</option>
                    <option value="MT">Modern Trade</option>
                    <option value="GT">General Trade</option>
                    <option value="HORECA">HORECA</option>
                    <option value="ECOMMERCE">E-Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <select
                    value={form.region}
                    onChange={(e) => updateField('region', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Regions</option>
                    <option value="SOUTH">South</option>
                    <option value="NORTH">North</option>
                    <option value="CENTRAL">Central</option>
                    <option value="HIGHLAND">Highland</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/contracts')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createContract.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {createContract.isPending ? 'Creating...' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </div>
  );
}
