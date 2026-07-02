"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  Address,
  AddressInput,
} from "@/lib/medusa-api";
import { toast } from "sonner";

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const emptyForm: AddressInput = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "in",
  phone: "",
};

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: AddressInput;
  onSave: (data: AddressInput) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressInput>(initial);

  function set(field: keyof AddressInput, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const inputClass =
    "w-full border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-sans text-xs text-muted-foreground mb-1">First Name *</label>
          <input
            className={inputClass}
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-muted-foreground mb-1">Last Name *</label>
          <input
            className={inputClass}
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-sans text-xs text-muted-foreground mb-1">Address Line 1 *</label>
        <input
          className={inputClass}
          value={form.address_1}
          onChange={(e) => set("address_1", e.target.value)}
          required
          placeholder="House / Flat no., Street"
        />
      </div>

      <div>
        <label className="block font-sans text-xs text-muted-foreground mb-1">Address Line 2</label>
        <input
          className={inputClass}
          value={form.address_2 ?? ""}
          onChange={(e) => set("address_2", e.target.value)}
          placeholder="Landmark, Area (optional)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-sans text-xs text-muted-foreground mb-1">City *</label>
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-muted-foreground mb-1">State *</label>
          <select
            className={inputClass}
            value={form.province}
            onChange={(e) => set("province", e.target.value)}
            required
          >
            <option value="">Select state</option>
            {INDIA_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-sans text-xs text-muted-foreground mb-1">PIN Code *</label>
          <input
            className={inputClass}
            value={form.postal_code}
            onChange={(e) => set("postal_code", e.target.value)}
            required
            pattern="[0-9]{6}"
            placeholder="6-digit PIN"
          />
        </div>
      </div>

      <div>
        <label className="block font-sans text-xs text-muted-foreground mb-1">Phone</label>
        <input
          className={inputClass}
          value={form.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+91 XXXXX XXXXX"
          type="tel"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="font-sans text-xs tracking-[0.15em] uppercase bg-foreground text-background px-8 py-2.5 hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-xs tracking-[0.15em] uppercase border border-border px-8 py-2.5 hover:border-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function formatAddress(addr: Address) {
  const parts = [
    addr.address_1,
    addr.address_2,
    addr.city,
    addr.province,
    addr.postal_code,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function AddressesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    listAddresses()
      .then(setAddresses)
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  async function handleCreate(data: AddressInput) {
    setSaving(true);
    try {
      const updated = await createAddress(data);
      setAddresses(updated);
      setShowForm(false);
      toast.success("Address saved.");
    } catch {
      toast.error("Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(addressId: string, data: AddressInput) {
    setSaving(true);
    try {
      const updated = await updateAddress(addressId, data);
      setAddresses(updated);
      setEditingId(null);
      toast.success("Address updated.");
    } catch {
      toast.error("Failed to update address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addressId: string) {
    setDeletingId(addressId);
    try {
      await deleteAddress(addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast.success("Address removed.");
    } catch {
      toast.error("Failed to remove address.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/account"
            className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            My Account
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-sans text-xs text-foreground">Addresses</span>
        </div>

        <div className="flex items-start justify-between mb-10">
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground">Saved Addresses</h1>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="font-sans text-xs tracking-[0.15em] uppercase border border-foreground px-6 py-2.5 hover:bg-foreground hover:text-background transition-colors"
            >
              + Add New
            </button>
          )}
        </div>

        {/* Add new form */}
        {showForm && (
          <div className="border border-border p-6 mb-8">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-6">New Address</p>
            <AddressForm
              initial={emptyForm}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              saving={saving}
            />
          </div>
        )}

        {fetching || isLoading ? (
          <p className="font-sans text-sm text-muted-foreground">Loading addresses...</p>
        ) : addresses.length === 0 && !showForm ? (
          <div className="text-center py-20">
            <p className="font-sans text-sm text-muted-foreground mb-6">
              You have no saved addresses yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="font-sans text-xs tracking-[0.15em] uppercase bg-foreground text-background px-10 py-3 hover:bg-foreground/90 transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-border p-6">
                {editingId === addr.id ? (
                  <AddressForm
                    initial={{
                      first_name: addr.first_name ?? "",
                      last_name: addr.last_name ?? "",
                      address_1: addr.address_1 ?? "",
                      address_2: addr.address_2 ?? "",
                      city: addr.city ?? "",
                      province: addr.province ?? "",
                      postal_code: addr.postal_code ?? "",
                      country_code: addr.country_code ?? "in",
                      phone: addr.phone ?? "",
                    }}
                    onSave={(data) => handleUpdate(addr.id, data)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <>
                    <p className="font-sans text-sm text-foreground font-medium mb-1">
                      {[addr.first_name, addr.last_name].filter(Boolean).join(" ")}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground leading-relaxed mb-1">
                      {formatAddress(addr)}
                    </p>
                    {addr.phone && (
                      <p className="font-sans text-xs text-muted-foreground mb-4">{addr.phone}</p>
                    )}
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => { setEditingId(addr.id); setShowForm(false); }}
                        className="font-sans text-xs text-foreground underline hover:no-underline transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        className="font-sans text-xs text-muted-foreground underline hover:text-foreground hover:no-underline transition-all disabled:opacity-50"
                      >
                        {deletingId === addr.id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
