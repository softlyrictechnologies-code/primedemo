import React, { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Checkbox from '../components/ui/Checkbox';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import Drawer from '../components/ui/Drawer';
import Toast from '../components/ui/Toast';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import ImageUploader from '../components/ui/ImageUploader';
import Gallery from '../components/ui/Gallery';
import PriceText from '../components/ui/PriceText';
import Breadcrumb from '../components/ui/Breadcrumb';

const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'amount', label: 'Price' },
];

const tableRows = [
  { id: 1, name: 'Nungambakkam Grove', status: 'published', amount: '₹ 46 Lakh' },
  { id: 2, name: 'Rajiv Gandhi', status: 'pending', amount: '₹ 87 Lakh' },
  { id: 3, name: 'Maraimalai Nagar', status: 'sold_out', amount: '₹ 1.2 Cr' },
];

export default function DevUiKitPage() {
  const [tab, setTab] = useState('all');
  const [openModal, setOpenModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [toastOpen, setToastOpen] = useState(true);
  const [files, setFiles] = useState([]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeader
          eyebrow="Design system"
          title="UI kit showcase"
          description="Reusable primitives for marketing and admin surfaces."
          action={<Button variant="secondary">Prototype</Button>}
        />

        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>New</Badge>
            <Badge variant="success">Approved</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="danger">Rejected</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Published" value={42} helper="Active listings" icon={<Building2 className="h-5 w-5" />} />
          <StatCard label="Pending" value={18} helper="Awaiting review" icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatCard label="Enquiries" value={139} helper="Total requests" icon={<Sparkles className="h-5 w-5" />} />
          <StatCard label="Verified" value={96} helper="Legal checks passed" icon={<ShieldCheck className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Status badges</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="published" />
              <StatusBadge status="pending" />
              <StatusBadge status="new" />
              <StatusBadge status="contacted" />
              <StatusBadge status="converted" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <Tabs
            items={[{ label: 'All', value: 'all', count: 24 }, { label: 'Published', value: 'published', count: 16 }, { label: 'Drafts', value: 'drafts', count: 4 }]}
            value={tab}
            onChange={setTab}
          />
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Form primitives</h3>
            <div className="space-y-4">
              <Field label="Property name" htmlFor="property-name" hint="Required">
                <Input id="property-name" placeholder="e.g. Green Valley Enclave" />
              </Field>
              <Select id="property-type" label="Property type" options={[{ value: 'plot', label: 'Plot' }, { value: 'villa', label: 'Villa' }]} />
              <Textarea id="description" label="Description" placeholder="Enter details here" />
              <Checkbox id="legal" label="Title verification has been completed" checked />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Price display</h3>
            <p className="text-2xl font-black text-neutral-900"><PriceText value={42} /></p>
            <p className="mt-4 text-2xl font-black text-neutral-900"><PriceText value={125} /></p>
            <div className="mt-6">
              <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Properties', to: '/properties' }, { label: 'Details' }]} />
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Image uploader</h3>
            <ImageUploader value={files} onChange={setFiles} />
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Gallery</h3>
            <Gallery images={['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80']} />
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-neutral-900">Data table</h3>
            <Button variant="secondary" onClick={() => setOpenModal(true)}>Open modal</Button>
          </div>
          <DataTable rows={tableRows} columns={tableColumns} page={1} totalPages={2} onPageChange={() => {}} />
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Skeleton</h3>
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Empty and error states</h3>
            <div className="space-y-4">
              <EmptyState title="No properties created" description="Add your first listing to start accepting enquiries." action={<Button variant="secondary">Create listing</Button>} />
              <ErrorState title="Failed to load data" message="Please retry in a moment." onRetry={() => setToastOpen(true)} />
            </div>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setOpenDrawer(true)}>Open drawer</Button>
          <Button variant="secondary" onClick={() => setToastOpen(true)}>Show toast</Button>
        </div>

        <Pagination page={2} totalPages={5} onPageChange={() => {}} />
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Example modal">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">This modal demonstrates a coupling with focus handling and close control.</p>
          <Button onClick={() => setOpenModal(false)} className="w-full">Continue</Button>
        </div>
      </Modal>

      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} title="Example drawer">
        <div className="space-y-4 text-sm text-neutral-600">
          <p>Drawer content is suitable for compact editing and review views.</p>
          <Button className="w-full" onClick={() => setOpenDrawer(false)}>Close</Button>
        </div>
      </Drawer>

      <Toast open={toastOpen} title="Saved" message="Changes are ready to sync." variant="success" onClose={() => setToastOpen(false)} />
    </div>
  );
}
