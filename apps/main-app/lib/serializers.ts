import type { Application, Document, Review } from "@hr/db";

type SerializableDocument = Omit<Document, "sizeBytes"> & { sizeBytes: number };

type ApplicationWithRelations = Application & {
  documents: Document[];
};

export function serializeDocuments(documents: Document[]): SerializableDocument[] {
  return documents.map((doc) => ({
    ...doc,
    sizeBytes: Number(doc.sizeBytes)
  }));
}

export function serializeApplication<T extends ApplicationWithRelations>(
  application: T
): Omit<T, "documents"> & { documents: SerializableDocument[] } {
  return {
    ...application,
    documents: serializeDocuments(application.documents)
  };
}

type ReviewWithDocs = Review & { documents?: Document[] };

export function serializeReview<T extends ReviewWithDocs>(review: T) {
  return {
    ...review,
    documents: review.documents ? serializeDocuments(review.documents) : undefined
  };
}
