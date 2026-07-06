import { Op, type WhereOptions } from "sequelize";
import type { PaginationQuery, VenueCreateInput, VenueDto, VenueUpdateInput } from "@eventsphere/shared";
import { Venue } from "@/models/index.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";
import type { Meta } from "@eventsphere/shared";

export function toVenueDto(v: Venue): VenueDto {
  return {
    id: v.id,
    name: v.name,
    addressLine: v.addressLine,
    city: v.city,
    state: v.state,
    pincode: v.pincode,
    capacity: v.capacity,
    latitude: v.latitude === null ? null : Number(v.latitude),
    longitude: v.longitude === null ? null : Number(v.longitude),
    facilities: v.facilities ?? [],
    images: v.images ?? [],
    createdAt: v.createdAt.toISOString(),
  };
}

export async function listVenues(query: PaginationQuery & { city?: string }): Promise<{ rows: Venue[]; meta: Meta }> {
  const where: WhereOptions = {
    ...(query.city ? { city: query.city } : {}),
    ...(query.search ? { name: { [Op.like]: `%${query.search}%` } } : {}),
  };
  const { rows, count } = await Venue.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

export async function getVenue(id: number): Promise<Venue> {
  const venue = await Venue.findByPk(id);
  if (!venue) throw new AppError(404, "NOT_FOUND", "Venue not found");
  return venue;
}

export async function createVenue(input: VenueCreateInput): Promise<Venue> {
  return Venue.create({
    name: input.name,
    addressLine: input.addressLine,
    city: input.city,
    state: input.state,
    pincode: input.pincode ?? null,
    capacity: input.capacity,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    facilities: input.facilities,
    images: input.images,
  });
}

export async function updateVenue(id: number, input: VenueUpdateInput): Promise<Venue> {
  const venue = await getVenue(id);
  return venue.update({ ...input });
}

export async function deleteVenue(id: number): Promise<void> {
  const venue = await getVenue(id);
  const EventModel = Venue.sequelize?.models.Event;
  if (EventModel) {
    const count = await EventModel.count({
      where: { venueId: id, status: "published", startTime: { [Op.gt]: new Date() } },
    });
    if (count > 0) throw new AppError(409, "CONFLICT", "Venue has upcoming published events and cannot be deleted");
  }
  await venue.destroy();
}
