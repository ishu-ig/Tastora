"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axiosInstance";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Home,
  LoaderCircle,
  MapPin,
  MapPinned,
  Navigation,
  Plus,
  X,
} from "lucide-react";

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";
const EMPTY_FORM = {
  label: "Home",
  address: "",
  city: "",
  state: "",
  pin: "",
  lat: null,
  lng: null,
  isDefault: false,
};

function errorMessage(error) {
  const reason = error?.response?.data?.reason;
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") return Object.values(reason).join(" ");
  return error?.response?.data?.message || "Something went wrong. Please try again.";
}

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth() || {};
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const searchController = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    api.get(`/address/user/${encodeURIComponent(user._id)}`, { signal: controller.signal })
      .then(({ data }) => setAddresses(Array.isArray(data?.data) ? data.data : []))
      .catch((requestError) => {
        if (requestError.name !== "CanceledError" && requestError.name !== "AbortError") {
          setError(errorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [authLoading, user?._id]);

  useEffect(() => {
    const text = query.trim();
    if (!isModalOpen || text.length < 3 || !GEOAPIFY_API_KEY) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    searchController.current = controller;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ text, limit: "5", apiKey: GEOAPIFY_API_KEY });
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Address search failed");
        const result = await response.json();
        setSuggestions(Array.isArray(result.features) ? result.features : []);
      } catch (searchError) {
        if (searchError.name !== "AbortError") setError("Could not search locations. Try again or enter the address manually.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isModalOpen, query]);

  const openModal = () => {
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setQuery("");
    setSuggestions([]);
    setError("");
    setIsModalOpen(true);
  };

  const selectSuggestion = (feature) => {
    const place = feature.properties || {};
    const [lng, lat] = feature.geometry?.coordinates || [];
    setForm((current) => ({
      ...current,
      address: [place.address_line1, place.address_line2].filter(Boolean).join(", ") || place.formatted || "",
      city: place.city || place.town || place.village || place.municipality || "",
      state: place.state || "",
      pin: place.postcode || "",
      lat: Number(lat),
      lng: Number(lng),
    }));
    setQuery(place.formatted || place.address_line1 || "");
    setSuggestions([]);
    setError("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }

    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({ ...current, lat: coords.latitude, lng: coords.longitude }));
        setLocating(false);
      },
      () => {
        setError("Location permission was denied. You can choose an address from search instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const closeModal = () => {
    searchController.current?.abort();
    setIsModalOpen(false);
    setSuggestions([]);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?._id) {
      setError("Sign in to save an address.");
      return;
    }
    if (!form.address.trim() || !Number.isFinite(form.lat) || !Number.isFinite(form.lng)) {
      setError("Choose a location from the search results to save its map coordinates.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const { data } = await api.post("/address", {
        user: user._id,
        label: form.label,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pin: form.pin.trim(),
        lat: form.lat,
        lng: form.lng,
        isDefault: form.isDefault || addresses.length === 0,
      });
      if (!data?.data) throw new Error(data?.reason || "Address was not saved.");
      setAddresses((current) => [data.data, ...current.map((address) => ({
        ...address,
        ...(data.data.isDefault ? { isDefault: false } : {}),
      }))]);
      closeModal();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const labelIcon = (label) => label === "Home" ? Home : label === "Work" ? BriefcaseBusiness : MapPinned;

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 pb-20 pt-36 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Delivery details</p>
            <h1 className="mt-2 text-3xl font-black">Your addresses</h1>
            <p className="mt-2 text-sm text-zinc-600">Manage the places where you receive orders.</p>
          </div>
          {user && (
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" /> Add address
            </button>
          )}
        </div>

        {authLoading || loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm font-medium text-zinc-500">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Loading addresses…
          </div>
        ) : !user ? (
          <section className="mt-8 border-y border-zinc-200 py-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-emerald-700" />
            <h2 className="mt-3 text-lg font-bold">Sign in to view your addresses</h2>
            <p className="mt-1 text-sm text-zinc-600">Your saved delivery locations are linked to your account.</p>
          </section>
        ) : error && addresses.length === 0 ? (
          <div role="alert" className="mt-8 border-y border-rose-200 py-5 text-sm text-rose-700">{error}</div>
        ) : addresses.length === 0 ? (
          <section className="mt-8 border-y border-zinc-200 py-12 text-center">
            <MapPinned className="mx-auto h-9 w-9 text-emerald-700" />
            <h2 className="mt-3 text-lg font-bold">No saved addresses</h2>
            <p className="mt-1 text-sm text-zinc-600">Add your first delivery address to make checkout faster.</p>
          </section>
        ) : (
          <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
            {addresses.map((address) => {
              const Icon = labelIcon(address.label);
              return (
                <article key={address._id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold">{address.label || "Address"}</h2>
                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-800">
                            <Check className="h-3 w-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-700">{address.address}</p>
                      <p className="text-sm text-zinc-600">{[address.city, address.state, address.pin].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                  {Number.isFinite(Number(address.lat)) && Number.isFinite(Number(address.lng)) && (
                    <a
                      href={`https://www.google.com/maps?q=${address.lat},${address.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 self-start text-xs font-bold text-emerald-800 hover:text-emerald-950"
                    >
                      View map <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="add-address-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4 sm:px-6">
              <div>
                <h2 id="add-address-title" className="text-lg font-black">Add an address</h2>
                <p className="mt-1 text-sm text-zinc-600">Search for a place, then check its delivery details.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
              <fieldset>
                <legend className="mb-2 text-xs font-bold text-zinc-700">Save this address as</legend>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={form.label === label}
                      onClick={() => setForm((current) => ({ ...current, label }))}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold ${form.label === label ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}
                    >
                      {label}
                    </button>
                  ))}
                  <label className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} />
                    Default
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor="address-search" className="mb-1.5 block text-xs font-bold text-zinc-700">Find location</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    id="address-search"
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={suggestions.length > 0}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setForm((current) => ({ ...current, lat: null, lng: null }));
                      setError("");
                    }}
                    placeholder="Street, building, or area"
                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                  />
                  {suggestions.length > 0 && (
                    <ul role="listbox" className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
                      {suggestions.map((feature, index) => (
                        <li key={`${feature.properties?.place_id || feature.properties?.formatted}-${index}`}>
                          <button type="button" role="option" aria-selected="false" onClick={() => selectSuggestion(feature)} className="w-full px-3 py-2.5 text-left hover:bg-emerald-50">
                            <span className="block text-sm font-semibold text-zinc-900">{feature.properties?.address_line1 || feature.properties?.name || feature.properties?.formatted}</span>
                            {feature.properties?.address_line2 && <span className="mt-0.5 block text-xs text-zinc-500">{feature.properties.address_line2}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="button" onClick={useCurrentLocation} disabled={locating} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 disabled:opacity-60">
                  {locating ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  {locating ? "Getting your location…" : "Use current location"}
                </button>
                {searching && <p className="mt-1.5 text-xs text-zinc-500">Searching locations…</p>}
                {!GEOAPIFY_API_KEY && <p className="mt-1.5 text-xs text-amber-700">Configure Geoapify to search addresses.</p>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold text-zinc-700 sm:col-span-2">
                  Street address / building
                  <textarea required rows={2} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </label>
                <label className="text-xs font-bold text-zinc-700">
                  City
                  <input required value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </label>
                <label className="text-xs font-bold text-zinc-700">
                  State / region
                  <input required value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </label>
                <label className="text-xs font-bold text-zinc-700">
                  Postal code
                  <input required value={form.pin} onChange={(event) => setForm((current) => ({ ...current, pin: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" />
                </label>
              </div>

              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
                <button type="button" onClick={closeModal} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
                  {isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Save address
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
