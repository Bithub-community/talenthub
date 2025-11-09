import { prisma } from "@/lib/prisma";

export async function createApplicationViewedNotification(params: {
  applicationId: string;
  reviewerUserId: string | null;
  ownerId: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.ownerId,
      type: "application_viewed",
      title: "Başvurunuz görüntülendi",
      body: `Başvurunuz ${params.reviewerUserId ?? "anonim"} tarafından görüntülendi`,
      createdAt: new Date(),
      metadata: {
        applicationId: params.applicationId,
        reviewerUserId: params.reviewerUserId
      }
    }
  });
}
