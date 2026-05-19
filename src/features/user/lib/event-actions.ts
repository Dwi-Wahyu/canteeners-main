"use server";

import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  successResponse,
  ServerActionReturn,
} from "@/helper/action-helper";

/**
 * Task 3 & 5: Logic Implementation for Granular Event
 * This function handles the atomic increment of usage and creation of EventUsage.
 */
export async function processEventParticipation(
  userId: string,
): Promise<ServerActionReturn<any>> {
  const now = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      // Check if event is active (Kill Switch)
      const event = await tx.event.findFirst({
        where: { is_active: true },
      });

      if (!event) {
        return errorResponse("Event is currently inactive");
      }

      // Find EventSlot based on current time
      // We search for a slot where the current time is between start_time and end_time
      const slot = await tx.eventSlot.findFirst({
        where: {
          event_id: event.id,
          start_time: { lte: now },
          end_time: { gte: now },
        },
      });

      if (!slot) {
        return errorResponse("No active event slot for this time");
      }

      // Check if user already participated (Unique userId constraint)
      const existingUsage = await tx.eventUsage.findUnique({
        where: { user_id: userId },
      });

      if (existingUsage) {
        return errorResponse("You have already participated in this event");
      }

      // Check quota and probability
      const isWithinQuota = slot.current_usage < slot.quota;
      let isLucky = false;
      let discountAmount = 0;
      let customerDiscountId = null;
      let finalSequenceNumber = slot.current_usage;

      if (isWithinQuota) {
        // Atomic increment
        const updatedSlot = await tx.eventSlot.update({
          where: { id: slot.id },
          data: { current_usage: { increment: 1 } },
        });
        finalSequenceNumber = updatedSlot.current_usage;

        // Logic: Setiap 5 user baru (1, 2, 3, 4), user setelahnya (5) mendapatkan voucher
        // Ini berarti user ke-5, ke-10, ke-15, dst. (sequence_number % 5 === 0)
        isLucky = finalSequenceNumber % 5 === 0;

        if (isLucky) {
          // Find a special 'Event Reward' discount template
          const discountTemplate = await tx.discount.findFirst({
            where: { code: "EVENT_REWARD_VOUCHER" },
          });

          if (discountTemplate) {
            const customer = await tx.customer.findUnique({
              where: { user_id: userId },
            });

            if (customer) {
              const newVoucher = await tx.customerDiscount.create({
                data: {
                  customer_id: customer.id,
                  discount_id: discountTemplate.id,
                  is_seen: false,
                },
              });
              customerDiscountId = newVoucher.id;
              discountAmount = discountTemplate.value;
            }
          }
        }
      } else {
        // Quota full
        isLucky = false;
        discountAmount = -1; // Indicator for quota full

        // Get a sequence number for them based on total participants
        const totalParticipants = await tx.eventUsage.count({
          where: { slot_id: slot.id },
        });
        finalSequenceNumber = totalParticipants + 1;
      }

      const usage = await tx.eventUsage.create({
        data: {
          user_id: userId,
          slot_id: slot.id,
          sequence_number: finalSequenceNumber,
          discount_amount: discountAmount,
          customer_discount_id: customerDiscountId,
          used_at: now,
        },
      });

      if (isLucky) {
        return successResponse(usage, "Selamat! Kamu mendapatkan voucher!");
      } else if (isWithinQuota) {
        return successResponse(usage, "Maaf, kamu belum beruntung kali ini.");
      } else {
        return successResponse(usage, "Maaf, kuota event sudah penuh.");
      }
    });
  } catch (error) {
    console.error("Error in processEventParticipation:", error);
    return errorResponse("Failed to process event participation");
  }
}

export async function getActiveEventSlot(
  userId?: string,
): Promise<ServerActionReturn<any>> {
  const now = new Date();

  try {
    const event = await prisma.event.findFirst({
      where: { is_active: true },
    });

    if (!event) {
      return errorResponse("Event is currently inactive");
    }

    const slot = await prisma.eventSlot.findFirst({
      where: {
        event_id: event.id,
        start_time: { lte: now },
        end_time: { gte: now },
      },
    });

    if (!slot) {
      return errorResponse("No active event slot for this time");
    }

    let hasParticipated = false;
    if (userId) {
      const usage = await prisma.eventUsage.findUnique({
        where: { user_id: userId },
      });
      hasParticipated = !!usage;
    }

    return successResponse({
      slot,
      hasParticipated,
    });
  } catch (error) {
    console.error("Error in getActiveEventSlot:", error);
    return errorResponse("Failed to fetch active event slot");
  }
}
