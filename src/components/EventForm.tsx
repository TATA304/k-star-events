import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { X, Plus, Upload, Star, ImagePlus, Check, ChevronDown } from "lucide-react";
import {
  ALL_CITIES,
  ALL_GROUPS,
  GROUP_ALIASES,
  RSVP_OPTIONS,
  isOfficialGroup,
  type City,
  type FanEvent,
  type RsvpStatus,
} from "@/lib/events";

export interface EventFormValues {
  title: string;
  group: string;
  member: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  cafe: string;
  address: string;
  city: City;
  googleMapsLink: string;
  rsvp: RsvpStatus;
  freebies: string[];
  organizer: string;
  description: string;
  images: string[];
}

export const EMPTY_FORM: EventFormValues = {
  title: "",
  group: "",
  member: "",
  date: "",
  startTime: "",
  endTime: "",
  cafe: "",
  address: "",
  city: "Kuala Lumpur",
  googleMapsLink: "",
  rsvp: "Open",
  freebies: [],
  organizer: "",
  description: "",
  images: [],
};

export function eventToForm(e: FanEvent): EventFormValues {
  const [start = "", end = ""] = (e.time ?? "").split(" - ");
  return {
    title: e.title,
    group: e.group,
    member: e.member,
    date: e.date,
    startTime: e.startTime ?? start,
    endTime: e.endTime ?? end,
    cafe: e.cafe,
    address: e.address,
    city: e.city,
    googleMapsLink: e.googleMapsLink ?? "",
    rsvp: e.rsvp,
    freebies: [...e.freebies],
    organizer: e.organizer,
    description: e.description ?? "",
    images: [...(e.images ?? [])],
  };
}

function resizeImage(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image load failed"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function EventForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: EventFormValues;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<EventFormValues>(initial);
  const [freebieInput, setFreebieInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof EventFormValues>(key: K, v: EventFormValues[K]) =>
    setValues((p) => ({ ...p, [key]: v }));

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    try {
      const datas = await Promise.all(files.map((f) => resizeImage(f)));
      setValues((p) => ({ ...p, images: [...p.images, ...datas] }));
    } catch (err) {
      console.error(err);
      setError("Could not process one of the images.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (i: number) =>
    setValues((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  const makeCover = (i: number) =>
    setValues((p) => {
      if (i === 0) return p;
      const next = [...p.images];
      const [pick] = next.splice(i, 1);
      next.unshift(pick);
      return { ...p, images: next };
    });

  const addFreebie = () => {
    const v = freebieInput.trim();
    if (!v) return;
    if (!values.freebies.includes(v)) {
      setValues((p) => ({ ...p, freebies: [...p.freebies, v] }));
    }
    setFreebieInput("");
  };

  const removeFreebie = (f: string) =>
    setValues((p) => ({ ...p, freebies: p.freebies.filter((x) => x !== f) }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.title.trim()) return setError("Event title is required");
    if (!values.group.trim()) return setError("Group name is required");
    if (!isOfficialGroup(values.group)) return setError("Please select a group from the list.");
    if (!values.member.trim()) return setError("Member name is required");
    if (!values.date) return setError("Event date is required");
    if (!values.cafe.trim()) return setError("Café name is required");
    if (!values.address.trim()) return setError("Full address is required");
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Images */}
      <section className="rounded-3xl border border-black bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-black">Event Images</h2>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-black bg-[#CAF5F7] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B0EEF1]"
          >
            <Upload className="h-4 w-4" /> Upload Images
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFiles}
          />
        </div>
        <p className="mb-3 text-xs text-[#777]">
          The first image is the cover. Click another image to make it the cover.
        </p>
        {values.images.length === 0 ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid w-full place-items-center gap-2 rounded-2xl border-2 border-dashed border-black/30 bg-[#F8F8F8] py-12 text-center text-[#777] hover:bg-[#F2FCFC]"
          >
            <ImagePlus className="h-8 w-8" />
            <p className="text-sm font-medium">No images uploaded yet</p>
            <p className="text-xs">Click to add multiple images</p>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {values.images.map((src, i) => (
              <div
                key={i}
                className={`group relative aspect-square overflow-hidden rounded-2xl border ${
                  i === 0 ? "border-black ring-2 ring-[#CAF5F7]" : "border-[#D9D9D9]"
                }`}
              >
                <img src={src} alt={`upload ${i}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-white" /> Cover
                  </span>
                )}
                <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(i)}
                      className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-black opacity-0 transition group-hover:opacity-100"
                    >
                      Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove"
                    className="ml-auto grid h-6 w-6 place-items-center rounded-full bg-black text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Basic info */}
      <section className="rounded-3xl border border-black bg-white p-6 space-y-5">
        <h2 className="font-display text-xl text-black">Event Information</h2>
        <Field label="Event Title" value={values.title} onChange={(v) => update("title", v)} />
        <div className="grid gap-5 sm:grid-cols-2">
          <GroupCombobox value={values.group} onChange={(v) => update("group", v)} />
          <Field label="Member Name" value={values.member} onChange={(v) => update("member", v)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Event Date"
            type="date"
            value={values.date}
            onChange={(v) => update("date", v)}
          />
          <Field
            label="Start Time"
            type="time"
            value={values.startTime}
            onChange={(v) => update("startTime", v)}
          />
          <Field
            label="End Time"
            type="time"
            value={values.endTime}
            onChange={(v) => update("endTime", v)}
          />
        </div>
      </section>

      {/* Location */}
      <section className="rounded-3xl border border-black bg-white p-6 space-y-5">
        <h2 className="font-display text-xl text-black">Location</h2>
        <Field label="Café Name" value={values.cafe} onChange={(v) => update("cafe", v)} />
        <Field label="Full Address" value={values.address} onChange={(v) => update("address", v)} />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-black">State / Location</span>
            <select
              value={values.city}
              onChange={(e) => update("city", e.target.value as City)}
              className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-base text-black outline-none focus:border-black"
            >
              {ALL_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Google Maps Link"
            value={values.googleMapsLink}
            onChange={(v) => update("googleMapsLink", v)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </section>

      {/* RSVP + Freebies */}
      <section className="rounded-3xl border border-black bg-white p-6 space-y-5">
        <h2 className="font-display text-xl text-black">RSVP & Freebies</h2>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black">RSVP Status</span>
          <div className="flex flex-wrap gap-2">
            {RSVP_OPTIONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => update("rsvp", r)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  values.rsvp === r
                    ? "border-black bg-black text-white"
                    : "border-[#D9D9D9] bg-white text-black hover:border-black"
                }`}
              >
                RSVP {r}
              </button>
            ))}
          </div>
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium text-black">Freebies / Benefits</span>
          <div className="flex gap-2">
            <input
              value={freebieInput}
              onChange={(e) => setFreebieInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFreebie();
                }
              }}
              placeholder="e.g. Cup sleeve, Photocard"
              className="flex-1 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-base text-black outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={addFreebie}
              className="inline-flex items-center gap-1 rounded-full border border-black bg-[#CAF5F7] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B0EEF1]"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {values.freebies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {values.freebies.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black bg-[#F2FCFC] px-3 py-1.5 text-sm text-black"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => removeFreebie(f)}
                    aria-label={`Remove ${f}`}
                    className="grid h-4 w-4 place-items-center rounded-full hover:bg-black/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Organizer & description */}
      <section className="rounded-3xl border border-black bg-white p-6 space-y-5">
        <h2 className="font-display text-xl text-black">Organizer & Description</h2>
        <Field
          label="Organizer Instagram / Contact"
          value={values.organizer}
          onChange={(v) => update("organizer", v)}
          placeholder="@your_handle"
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black">Event Description</span>
          <textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            placeholder="Share what makes this fan café special..."
            className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-base text-black outline-none focus:border-black"
          />
        </label>
      </section>

      {error && (
        <div className="rounded-xl border border-[#E57373]/40 bg-[#E57373]/10 px-4 py-2.5 text-sm font-medium text-[#B14545]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-[#F2FCFC]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded-full bg-black px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#333]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-black">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-base text-black outline-none transition focus:border-black"
      />
    </label>
  );
}

function GroupCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "");
    if (!q) return [...ALL_GROUPS];
    const matches = new Set<string>();
    for (const g of ALL_GROUPS) {
      if (g.toLowerCase().replace(/\s+/g, "").includes(q)) matches.add(g);
    }
    for (const [alias, official] of Object.entries(GROUP_ALIASES)) {
      if (alias.toLowerCase().includes(q)) matches.add(official);
    }
    return Array.from(matches);
  }, [query]);

  const pick = (g: string) => {
    onChange(g);
    setQuery(g);
    setOpen(false);
  };

  const invalid = query.trim().length > 0 && !isOfficialGroup(query) && !open;

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-black">Group Name</span>
        <div className="relative">
          <input
            type="text"
            value={query}
            placeholder="Search a group (e.g. SEVENTEEN)"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlight(0);
              if (!isOfficialGroup(e.target.value)) onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter") {
                if (open && suggestions[highlight]) {
                  e.preventDefault();
                  pick(suggestions[highlight]);
                }
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-base text-black outline-none transition focus:border-black ${
              invalid ? "border-[#E57373]" : "border-[#D9D9D9]"
            }`}
          />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
        </div>
      </label>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-black bg-white shadow-lg">
          {suggestions.map((g, i) => (
            <li key={g}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(g)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                  i === highlight ? "bg-[#F2FCFC]" : "bg-white"
                } ${value === g ? "font-semibold text-black" : "text-black"}`}
              >
                <span>{g}</span>
                {value === g && <Check className="h-4 w-4 text-black" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && suggestions.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-black bg-white px-4 py-3 text-sm text-[#777]">
          No matching group. Please select from the official list.
        </div>
      )}
      {invalid && (
        <p className="mt-1 text-xs font-medium text-[#E57373]">Please select a group from the list.</p>
      )}
    </div>
  );
}
