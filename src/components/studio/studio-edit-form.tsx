"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudio } from "@/server/actions/studios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDIO_TYPE_LABELS, STUDIO_AMENITIES } from "@/config/enums";
import type { StudioType } from "@prisma/client";

const STUDIO_TYPES = Object.keys(STUDIO_TYPE_LABELS) as StudioType[];

interface StudioEditFormProps {
  studio: {
    id: string;
    name: string;
    description: string | null;
    studioType: StudioType;
    address: string | null;
    city: string | null;
    region: string | null;
    zipCode: string | null;
    sizeSqm: number | null;
    maxCapacity: number | null;
    amenities: string[];
    hourlyRate: number | null;
    dailyRate: number | null;
    weeklyRate: number | null;
    minHours: number | null;
    availabilityNotes: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
}

export function StudioEditForm({ studio }: StudioEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(studio.name);
  const [studioType, setStudioType] = useState(studio.studioType);
  const [description, setDescription] = useState(studio.description || "");
  const [address, setAddress] = useState(studio.address || "");
  const [city, setCity] = useState(studio.city || "");
  const [region, setRegion] = useState(studio.region || "");
  const [zipCode, setZipCode] = useState(studio.zipCode || "");
  const [sizeSqm, setSizeSqm] = useState(studio.sizeSqm?.toString() || "");
  const [maxCapacity, setMaxCapacity] = useState(studio.maxCapacity?.toString() || "");
  const [hourlyRate, setHourlyRate] = useState(studio.hourlyRate?.toString() || "");
  const [dailyRate, setDailyRate] = useState(studio.dailyRate?.toString() || "");
  const [weeklyRate, setWeeklyRate] = useState(studio.weeklyRate?.toString() || "");
  const [minHours, setMinHours] = useState(studio.minHours?.toString() || "");
  const [availabilityNotes, setAvailabilityNotes] = useState(studio.availabilityNotes || "");
  const [contactEmail, setContactEmail] = useState(studio.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(studio.contactPhone || "");
  const [amenities, setAmenities] = useState<string[]>(studio.amenities);

  const toggleAmenity = (key: string) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaved(false);

    try {
      const result = await updateStudio(studio.id, {
        name: name.trim(),
        studioType,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        region: region.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        sizeSqm: sizeSqm ? parseInt(sizeSqm) : undefined,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : undefined,
        minHours: minHours ? parseInt(minHours) : undefined,
        availabilityNotes: availabilityNotes.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        amenities,
      });

      if (result.success) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && (
        <div className=" bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
          Modifiche salvate con successo
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Informazioni base</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" required>Nome dello studio</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studioType" required>Tipo di spazio</Label>
            <select
              id="studioType"
              value={studioType}
              onChange={(e) => setStudioType(e.target.value as StudioType)}
              className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {STUDIO_TYPES.map((type) => (
                <option key={type} value={type}>{STUDIO_TYPE_LABELS[type].it}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Posizione</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Indirizzo</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Città</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Regione</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>CAP</Label>
            <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="max-w-[120px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Dettagli spazio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Superficie (m²)</Label>
              <Input type="number" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Capienza max</Label>
              <Input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Servizi inclusi</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STUDIO_AMENITIES.map((amenity) => (
              <label
                key={amenity.key}
                className={`flex items-center gap-2  border p-3 cursor-pointer text-sm transition-colors ${
                  amenities.includes(amenity.key)
                    ? "border-[var(--ink)] bg-[var(--ink)]/5 text-[var(--ink)]"
                    : "border-[var(--rule)] text-[var(--ink-3)] hover:border-[var(--accent)]/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity.key)}
                  onChange={() => toggleAmenity(amenity.key)}
                  className="sr-only"
                />
                <span className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                  amenities.includes(amenity.key) ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--bg-elevated)]" : "border-[var(--ink-3)]/30"
                }`}>
                  {amenities.includes(amenity.key) && "✓"}
                </span>
                {amenity.label.it}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Tariffe</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Oraria (€)</Label>
              <Input type="number" step="0.01" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Giornaliera (€)</Label>
              <Input type="number" step="0.01" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Settimanale (€)</Label>
              <Input type="number" step="0.01" value={weeklyRate} onChange={(e) => setWeeklyRate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Minimo ore</Label>
            <Input type="number" value={minHours} onChange={(e) => setMinHours(e.target.value)} className="max-w-[120px]" />
          </div>
          <div className="space-y-2">
            <Label>Note disponibilità</Label>
            <Textarea value={availabilityNotes} onChange={(e) => setAvailabilityNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Contatti</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Salva modifiche
        </Button>
      </div>
    </form>
  );
}
