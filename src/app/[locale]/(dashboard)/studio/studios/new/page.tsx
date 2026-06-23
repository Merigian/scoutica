"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { createStudio } from "@/server/actions/studios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Select } from "@/components/ui/select";
import { StudioLocationMap } from "@/components/studio/studio-location-map";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDIO_TYPE_LABELS, STUDIO_AMENITIES } from "@/config/enums";
import { ALL_REGION_NAMES } from "@/config/regions";
import { WeeklyAvailabilityPicker } from "@/components/studio/weekly-availability-picker";
import {
  emptyWeeklyAvailability,
  serializeWeeklyAvailability,
  type WeeklyAvailability,
} from "@/lib/studio-availability";
import type { StudioType } from "@prisma/client";

const STUDIO_TYPES = Object.keys(STUDIO_TYPE_LABELS) as StudioType[];

export default function NewStudioPage() {
  const router = useRouter();
  const t = useTranslations("pages.studio.createStudio");
  const tc = useTranslations("common");
  const tw = useTranslations("components.weeklyAvailability");
  const locale = useLocale();
  const lang = (locale === "en" ? "en" : "it") as "it" | "en";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [studioType, setStudioType] = useState<StudioType>("PHOTO_STUDIO");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [sizeSqm, setSizeSqm] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("");
  const [minHours, setMinHours] = useState("");
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(
    emptyWeeklyAvailability()
  );
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const toggleAmenity = (key: string) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createStudio({
        name: name.trim(),
        studioType,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        region: region.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        sizeSqm: sizeSqm ? parseInt(sizeSqm) : undefined,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : undefined,
        minHours: minHours ? parseFloat(minHours) : undefined,
        weeklyAvailability: serializeWeeklyAvailability(weeklyAvailability),
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        amenities,
      });

      if (!result.success) {
        setError(result.error || t("createError"));
        return;
      }

      router.push(`/studio/studios/${result.data!.studioId}` as never);
    } catch {
      setError(t("createError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{t("title")}</h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className=" bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-4 py-3 text-sm text-[var(--accent)]">
            {error}
          </div>
        )}

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>{t("studioName")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studioType" required>{t("spaceType")}</Label>
              <select
                id="studioType"
                value={studioType}
                onChange={(e) => setStudioType(e.target.value as StudioType)}
                className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STUDIO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {STUDIO_TYPE_LABELS[type][lang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{tc("description")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descPlaceholder")}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("location")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">{tc("address")}</Label>
              <AddressAutocomplete
                id="address"
                mode="address"
                value={address}
                onChange={setAddress}
                onSelect={(r) => {
                  setAddress(r.address || r.text);
                  if (r.city) setCity(r.city);
                  if (r.region) setRegion(r.region);
                  if (r.postcode) setZipCode(r.postcode);
                  setLatitude(r.lat);
                  setLongitude(r.lng);
                }}
                placeholder={t("addressPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">{t("city")}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("cityPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">{t("region")}</Label>
                <Select
                  id="region"
                  options={ALL_REGION_NAMES.map((r) => ({ value: r, label: r }))}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder={tc("select")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">{t("zip")}</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder={t("zipPlaceholder")}
                className="max-w-[120px]"
              />
            </div>
            <StudioLocationMap
              lat={latitude}
              lng={longitude}
              onChange={(la, ln) => {
                setLatitude(la);
                setLongitude(ln);
              }}
            />
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("spaceDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sizeSqm">{t("area")}</Label>
                <Input
                  id="sizeSqm"
                  type="number"
                  value={sizeSqm}
                  onChange={(e) => setSizeSqm(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">{t("maxCapacity")}</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  placeholder="15"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("amenities")}</CardTitle>
          </CardHeader>
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
                  {amenity.label[lang]}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("rates")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">{t("hourlyRate")}</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyRate">{t("dailyRate")}</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  step="0.01"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="350"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyRate">{t("weeklyRate")}</Label>
                <Input
                  id="weeklyRate"
                  type="number"
                  step="0.01"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  placeholder="1500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minHours">{t("minHours")}</Label>
              <Input
                id="minHours"
                type="number"
                min={0.5}
                step={0.5}
                value={minHours}
                onChange={(e) => setMinHours(e.target.value)}
                placeholder="1"
                className="max-w-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Weekly availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tw("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--ink-3)] mb-4">{tw("subtitle")}</p>
            <WeeklyAvailabilityPicker
              value={weeklyAvailability}
              onChange={setWeeklyAvailability}
            />
          </CardContent>
        </Card>

        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("contacts")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t("email")}</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">{t("phone")}</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {tc("cancel")}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
