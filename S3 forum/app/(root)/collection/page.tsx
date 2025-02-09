// app/collections/page.tsx (or components/Collections.tsx)

import React from "react";
import CollectionCard from "@/components/cards/CollectionCard"; // Assuming you have a CollectionCard component
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_COLLECTIONS } from "@/constants/states"; // Assuming you have a constant for empty state
import { getCollections } from "@/lib/actions/collection.action"; // Assuming you have a function to fetch collections

const Collections = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getCollections({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { collections } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Collections</h1>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COLLECTIONS} // Assuming you have a route constant for collections
          imgSrc="/icons/search.svg"
          placeholder="Search collections..."
          otherClasses="flex-1"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={collections}
        empty={EMPTY_COLLECTIONS}
        render={(collections) => (
          <div className="mt-10 flex w-full flex-wrap gap-4">
            {collections.map((collection) => (
              <CollectionCard key={collection._id} {...collection} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default Collections;